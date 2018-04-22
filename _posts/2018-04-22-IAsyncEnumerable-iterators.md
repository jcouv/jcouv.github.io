---
published: false
---
## Working on IAsyncEnumerable iterator methods

My intuition as a starting point is that we should be able to re-use much of the code generated for a regular async method.

Most of the work happens in a state machine method (`MoveNext`). It has a special convention to hand-off the awaited work.

See the generated `MoveNext` method in a [simple async method](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQGMD2BbADgSwBsIEAaAExAGoAfAAQAYACOgRgG4BYAKEZdYCsXbjzoBmFgCYmAYSYBvHk2UsJdABwsAbEwCyACgCUCpSrN0AnNoB0MnLmIwI5OluFmAvjw9A)

As you can see, every time an `await` is reached, we'll get a task (promise) from the long-running async method that we're calling. Then we'll save our current state (so the `MoveNext` can be resumed later) and register `MoveNext` to be continued once that long-running method completes (using  `AsyncTaskMethodBuilder.Await...OnCompleted`) 

With this state machine in place, the iterator method is just initializing the state machine and starting it.
With IAsyncEnumerable iterators, there are two foreseable differences:
- in addition to `await` checkpoints, the state machine should also handle `yield` checkpoints, by pausing and making a value available,
- the state machine should not just run by itself. User code should interact with the machine using `WaitForNextAsync` and `TryGetNext` methods.

The first point seems straightforward, as supporting `yield` checkpoints seems just a matter of storing a `current` value and having some handshake for pausing and restarting the method. See the generated `MoveNext` method in a [simple enumerator method](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQGMD2BbADgSwBsIEAaAExAGoAfAAQAYACOgRgG4BYAKEZdYAsXXgGYWAJiYBhJgG8eTRSzFsRAHnwA7GAD4mAWQAUASjkKlFtqxYB2JgPHCLAXx7OgA=) 
