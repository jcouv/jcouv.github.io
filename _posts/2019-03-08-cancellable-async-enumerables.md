---
published: false
---


## Cancellable async enumerables

Visual Studio 2019 (currently in preview) includes a preview of C# 8.0 and the async-streams feature.

Very briefly, three parts compose this feature:
1. async iterator methods: you can write methods with `async` that return `IAsyncEnumerable` or `IAsyncEnumerator` and using both `yield` and `await` syntax.
2. `await foreach`: you can asynchronously enumerate collections that implement `IAsyncEnumerable` (or implement equivalent APIs).
3. `await using`: you can asynchronously dispose resources that implement `IAsyncDisposable`.

Following a similar execution pattern as its synchronous sibling `foreach`, the `await foreach` first gets an enumerator for the collection (by calling `GetAsyncEnumerator()`, then repeatedly calls `await enumerator.MoveNextAsync()` and gets the item with `Current` until the enumerator is exhausted.

If you look at the relevant APIs, `IAsyncEnumerable` and `IAsyncEnumerator` (copied below), you may have noticed that `GetAsyncEnumerator` accepts a `CancellationToken` parameter. We'll look at two things: how do you write a cancellable async iterator, and how do you consume one.

### Writing a cancellable async enumerable

Let's say that you intend to write `IAsyncEnumerable<int> GetItemsAsync(int maxItems)` supporting cancellation. 

You cannot just write an async iterator method `async IAsyncEnumerable<int> GetItemsAsync(int maxItems)` because that does not give you access to any cancellation token. Instead you need to implement a type for the enumerable and use an async iterator method returning `IAsyncEnumerator<int>` with your logic.

We recognize this involves some boilerplate and are considering some language design options to simplify this further.

```C#
    public static IAsyncEnumerable<int> GetItemsAsync(int maxItems)
        => new MyCancellableCollection(maxItems);
    
    class MyCancellableCollection : IAsyncEnumerable<int>
    {
        private int _maxItems;
        internal MyCancellableCollection(int maxItems)
        {
            _maxItems = maxItems;
        }
        
        public async IAsyncEnumerator<int> GetAsyncEnumerable(CancellationToken cancellationToken)
        {
            // Your method body using:
            // - `_maxItems`
            // - `cancellationToken.ThrowIfCancelled();`
            // - `await`
            // - `yield` constructs
        }
    }
```



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


https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/Collections/Generic/IAsyncEnumerable.cs
https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/Collections/Generic/IAsyncEnumerator.cs
https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/IAsyncDisposable.cs

