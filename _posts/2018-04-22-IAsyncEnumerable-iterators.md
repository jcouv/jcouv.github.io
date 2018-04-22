---
published: false
---
## Designing IAsyncEnumerable iterator methods
Before starting, see this [blog post](https://blogs.msdn.microsoft.com/seteplia/2017/11/30/dissecting-the-async-methods-in-c/) for some background.

My intuition as a starting point is that we should be able to re-use much of the code generated for a regular async method.
Most of the work happens in a state machine method (`MoveNext`).  It has a special handshake to hand-off the awaited work. In comparison the handshake for the `MoveNext` for enumerables is much simpler, so it seems easier to extend the `async` machinery to handle `yield` than the reverse.

I already knew that a state number would be generated for each checkpoint (a `yield` or `await`) in the code, plus the Start (`-1`) and End (`-2`) states. For some reason, I fixated from the start on separating the two kinds of checkpoints between even and odd numbers (even for `await` and odd for `yield`). I thought I would need to tell which kind of checkpoint the machine is paused on, so that the methods calling it (`WaitForNextAsync` and `TryGetNext`) would know what to expect and how to resume execution with proper handshake.

So I started by looking at the generated `MoveNext` method in a [simple async method](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQGMD2BbADgSwBsIEAaAExAGoAfAAQAYACOgRgG4BYAKEZdYCsXbjzoBmFgCYmAYSYBvHk2UsJdABwsAbEwCyACgCUCpSrN0AnNoB0MnLmIwI5OluFmAvjw9A).

As you can see, every time an `await` is reached, we'll get a task (promise) from the long-running async method that we're calling. Then we'll save our current state (so the `MoveNext` can be resumed later) and register `MoveNext` to be continued once that long-running method completes (using  `AsyncTaskMethodBuilder.Await...OnCompleted`) 

With this state machine in place, the iterator method is just initializing the state machine and starting it.

With IAsyncEnumerable iterators, there are two foreseable differences:
- in addition to `await` checkpoints, the state machine should also handle `yield` checkpoints, by pausing and making a value available,
- the state machine should not just run by itself. User code should interact with the machine using `WaitForNextAsync` and `TryGetNext` methods.

The first point seems straightforward, as supporting `yield` checkpoints seems just a matter of storing a `current` value and having some handshake for pausing and restarting the method. See the generated `MoveNext` method in a [simple enumerator method](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQGMD2BbADgSwBsIEAaAExAGoAfAAQAYACOgRgG4BYAKEZdYAsXXgGYWAJiYBhJgG8eTRSzFsRAHnwA7GAD4mAWQAUASjkKlFtqxYB2JgPHCLAXx7OgA=) 

But I tried working out some scenarios on paper, and writing down rules for each method as [pseudocode](https://github.com/jcouv/async-iterators/blob/master/notes.cs) in design notes, and noticed some subleties. I started with a very simple scenario, a method with a statement and a `yield`, and tried to work out what would happen in each state if you called either `WaitForNextAsync` or `TryGetNext`.
Using a different notation/representation helped think about the problem, and helped me realize that this framing was wrong. It assumed that both `WaitForNextAsync` and `TryGetNext` would only run user code until the next checkpoint (an `await` or `yield`).
But the expectation from users writing async code is that it would just resume automatically after each `await`.

In other words, a call to `WaitForNextAsync` should run the user code until a `yield` is reached (or the end of the method). Conversely, a call to `TryGetNext` might reach an `async`, thus causing the machine to start running in the background.
Such transitions caused me some headache. For instance, if two `yield`s follow an `await`, I initially thought of three states (state 0 for the `await` and states 1 and 3 for the `yield`s), but had trouble getting `TryGetNext` to print the value in state 1. If you call `TryGetNext` on state 1, you want it to return a value without moving the state machine forward, the first time, but when you call it again (still in state 1) you want it to execute user code and move to the next state.
I thought I'd need some additional states (1A and 1B) to indicate that I'm in state 1 but the current yielded value has been reported or not...
With branches, we could get to state 1 following an `async` or following a `yield`.

Those half-states didn't work out well, and I realized the decision for `TryGetNext` on whether to move the execution forward (calling `MoveNext`) depends on whether it follows a `WaitForNextAsync` call. Although that's actually incorrect, as we'll see later, this set me on the track of having one more element stored in the state machine, to use as part of the handshakes.

I realized that (1) we would need a second `Task`

So I [hand-crafted](https://github.com/jcouv/async-iterators/blob/master/src/Program.cs) a simple state machine to validate my design.

I also realized that (2) 

