---
title: Async Enumerables with Cancellation
published: true
---

In this post, I'll explain how to produce and consume async enumerables with support for cancellation. 

### Some context

C# 8.0 added support for async-streams, which is composed of three parts:
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

### Writing an async enumerable supporting cancellation


Let's say that you intend to write `IAsyncEnumerable<int> GetItemsAsync(int maxItems)` supporting cancellation. 

If you just declared the method as `async IAsyncEnumerable<int> GetItemsAsync(int maxItems, CancellationToken token)`, you would be able to pass a cancellation token as an argument, then use it in the body of the method. 
But the resulting async-iterator would not properly implement the `IAsyncEnumerable.GetAsyncEnumerator(CancellationToken)` API, because it would drop the cancellation token passed to it.
The solution is to declare the method as `async IAsyncEnumerable<int> GetItemsAsync(int maxItems, [EnumeratorCancellation] CancellationToken token)`.
Because of the attribute, the `token` parameter will be set to a synthesized cancellation token that combines two token: the one passed as an argument to the method, and the other given to `GetAsyncEnumerator`. This synthesized token gets cancelled when either of the two given tokens is cancelled.

```csharp
async IAsyncEnumerable<int> GetItemsAsync(int maxItems, [EnumeratorCancellation] CancellationToken token)
{
    // Your method body using:
    // - `_maxItems`
    // - `token.ThrowIfCancelled();`
    // - `await` and `yield` constructs
}
```

### Consuming an async enumerable with cancellation

There are two scenarios for consuming an async enumerable:
1. If the method that creates the async enumerable has a cancellation token parameter marked with `[EnumeratorCancellation]`, then just call that method with the cancellation token you need: `await foreach (var item in GetItemsAsync(maxItems: 10, token)) ...`.
2. If the async enumerable instance is given to you, or is constructed in a way to doesn't capture the desired cancellation token, then you can feed the cancellation token using the  `WithCancellation<T>(this IAsyncEnumerable<T> source, CancellationToken cancellationToken)` [extension method](https://github.com/dotnet/coreclr/pull/21939): `await foreach (var item in GetItemsAsync(maxItems: 10).WithCancellation(token)) ...`.

The `WithCancellation` helper method wraps the enumerable from `GetItemsAsync` along with the given cancellation token. When `GetAsyncEnumerator()` is invoked on this wrapper, it calls `GetAsyncEnumerator(token)` on the underlying enumerable.

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
