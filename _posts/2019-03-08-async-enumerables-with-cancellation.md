---
title: Async Enumerables with Cancellation
published: true
---

In this post, I'll explain how to produce and consume async enumerables with support for cancellation. Since originally publishing this post, we've added support in the language for a new attribute which solve this problem more elegantly. I've added a section detailing the new method.

### Some context

Visual Studio 2019 (currently in preview) includes a preview of C# 8.0 and the async-streams feature.

Three parts compose this feature:
1. async-iterator methods: you can write methods with the `async` modifier, returning either `IAsyncEnumerable` or `IAsyncEnumerator`, and  using both `yield` and `await` syntax.
2. `await foreach`: you can asynchronously enumerate collections that implement `IAsyncEnumerable` (or implement equivalent APIs).
3. `await using`: you can asynchronously dispose resources that implement `IAsyncDisposable`.

`await foreach` follows a similar execution pattern as its synchronous sibling `foreach`: it first gets an enumerator from the enumerable (by calling `GetAsyncEnumerator()`, then repeatedly does `await MoveNextAsync()` on the enumerator and gets the item with `Current` until the enumerator is exhausted.

Here's the code generated for an `await foreach`:

```csharp
E e = ((C)(x)).GetAsyncEnumerator();
try
{
    while (await e.MoveNextAsync())
    {
        V v = (V)(T)e.Current;
        // body
    }
}
finally
{
    await e.DisposeAsync();
}
```

You may notice in the relevant APIs (copied below) that `GetAsyncEnumerator` accepts a `CancellationToken` parameter. But `await foreach` doesn't make use of this parameter (it passes a `default` value).

This raises two questions: 1) how do you write an async enumerable with support for cancellation? and 2) how do you consume one?

### Writing an async enumerable supporting cancellation (original method)

Let's say that you intend to write `IAsyncEnumerable<int> GetItemsAsync(int maxItems)` supporting cancellation. 

You cannot just write an async iterator method `async IAsyncEnumerable<int> GetItemsAsync(int maxItems)` because that does not give you access to any cancellation token. 

You also cannot write an async iterator method `async IAsyncEnumerable<int> GetItemsAsync(int maxItems, CancellationToken token)` because:
1. if a method has its own cancellation token and wants to enumerate an async enumerable it received, it could not use the token it wants with that enumerable (the cancellation token would be already built into the enumerable),
2. the same cancellation token would be used in every enumerator when the collection is enumerated multiple times,

So instead, you need to implement the enumerable yourself and put your business logic in `async IAsyncEnumerator<int> GetAsyncEnumerable(CancellationToken cancellationToken)`.

Here's what that looks like:

```csharp
public static IAsyncEnumerable<int> GetItemsAsync(int maxItems)
    => new MyCancellableCollection(maxItems);
    
class MyCancellableCollection : IAsyncEnumerable<int>
{
    private int _maxItems;
    internal MyCancellableCollection(int maxItems)
        => _maxItems = maxItems;
        
    public async IAsyncEnumerator<int> GetAsyncEnumerator(CancellationToken cancellationToken)
    {
        // Your method body using:
        // - `_maxItems`
        // - `cancellationToken.ThrowIfCancelled();`
        // - `await` and `yield` constructs
    }
}
```

~~We recognize that this involves boilerplate. We are considering some language design options to further simplify this.~~
Since originally publishing this, we've solved this problem more elegantly by extending the language. The next section explains the updated design.

### Writing an async enumerable supporting cancellation (improved method)

In an updated preview of C# 8.0 (shipping in Visual Studio 2019 version 16.1), we'll be adding support for the `[EnumeratorCancellation]` token. The attribute allows you to write an async-iterator method, returning `IAsyncEnumerable<T>` as you intend, but tells the compiler to store the token from `GetAsyncEnumerator(CancellationToken)` into one of your method's parameters.

In the above example, you would just declare the method as `async IAsyncEnumerable<int> GetItemsAsync(int maxItems, [EnumeratorCancellation] CancellationToken token)`. Because of the attribute, the `token` parameter will be set to a synthesized cancellation token that combines two token: the one passed as an argument to the method, and the other given to `GetAsyncEnumerator`. This synthesized token gets cancelled when either of the two given tokens is cancelled.

```csharp
async IAsyncEnumerable<int> GetItemsAsync(int maxItems, [EnumeratorCancellation] CancellationToken token)
{
        // Your method body using:
        // - `_maxItems`
        // - `token.ThrowIfCancelled();`
        // - `await` and `yield` constructs
}
```

Note: in dev16.1 preview5, we have not yet implemented this method of combining tokens, we took a simpler approach whereby any non-default token given to `GetAsyncEnumerator` will override the token passed as an argument. I expect to implement the more elaborate method of combining tokens in preview6 timeframe.

### Consuming an async enumerable with cancellation

With the above implementation, if you wrote `await foreach (var item in GetItemsAsync(maxItems: 10)) ...`, a `default` cancellation token would be passed to the cancellable method.

Users of enumerables could try and expand the low-level code for an `await foreach` to pass a token, but that's a terrible solution (defeats the purpose of `await foreach`).

To help with this, we provide a `WithCancellation<T>(this IAsyncEnumerable<T> source, CancellationToken cancellationToken)` [extension method](https://github.com/dotnet/coreclr/pull/21939). It allows you to pass your `token` in: 

```csharp
await foreach (var item in GetItemsAsync(maxItems: 10).WithCancellation(token)) ...
```

This helper method wraps the enumerable from `GetItemsAsync` along with the given cancellation token. When `GetAsyncEnumerator()` is invoked on this wrapper, it calls `GetAsyncEnumerator(token)` on the underlying enumerable.

### Appendix: relevant interfaces

```csharp
using System.Threading;

namespace System.Collections.Generic
{
    /// <summary>Exposes an enumerator that provides asynchronous iteration over values of a specified type.</summary>
    /// <typeparam name="T">The type of values to enumerate.</typeparam>
    public interface IAsyncEnumerable<out T>
    {
        /// <summary>Returns an enumerator that iterates asynchronously through the collection.</summary>
        /// <param name="cancellationToken">A <see cref="CancellationToken"/> that may be used to cancel the asynchronous iteration.</param>
        /// <returns>An enumerator that can be used to iterate asynchronously through the collection.</returns>
        IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default);
    }

    /// <summary>Supports a simple asynchronous iteration over a generic collection.</summary>
    /// <typeparam name="T">The type of objects to enumerate.</typeparam>
    public interface IAsyncEnumerator<out T> : IAsyncDisposable
    {
        /// <summary>Advances the enumerator asynchronously to the next element of the collection.</summary>
        /// <returns>
        /// A <see cref="ValueTask{Boolean}"/> that will complete with a result of <c>true</c> if the enumerator
        /// was successfully advanced to the next element, or <c>false</c> if the enumerator has passed the end
        /// of the collection.
        /// </returns>
        ValueTask<bool> MoveNextAsync();

        /// <summary>Gets the element in the collection at the current position of the enumerator.</summary>
        T Current { get; }
    }
    
    /// <summary>Provides a mechanism for releasing unmanaged resources asynchronously.</summary>
    public interface IAsyncDisposable
    {
        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or
        /// resetting unmanaged resources asynchronously.
        /// </summary>
        ValueTask DisposeAsync();
    }
}
```

Original code for [IAsyncEnumerable](https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/Collections/Generic/IAsyncEnumerable.cs), [IAsyncEnumerator](https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/Collections/Generic/IAsyncEnumerator.cs) and [IAsyncDisposable](https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/IAsyncDisposable.cs).

For further details, see the [async-streams design doc](https://github.com/dotnet/roslyn/blob/master/docs/features/async-streams.md).
