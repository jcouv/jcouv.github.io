---
published: false
title: Analyzing a nullability example
---

Cezary Piatek posted a good [overview of the C# nullable reference types feature](https://cezarypiatek.github.io/post/non-nullable-references-in-dotnet-core/). 
It includes a [critique of a code snippet](https://cezarypiatek.github.io/post/non-nullable-references-in-dotnet-core/#there-is-still-room-for-improvement). Examining that snippet is a good way to understand some of the C# LDM's decisions.
In the following, Cezary expects a warning on a seemingly unreachable branch and no warning on the dereference.

``` csharp
#nullable enable

public class User 
{
    public static void Method(User userEntity)
    {
        if (userEntity == null) // Actual: no warning for seemingly unreachable branch. 
        {
        }
        
        var s = userEntity.ToString(); // Actual: warning CS8602: Dereference of a possibly null reference.
    }
}
```
[sharplab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA+BiAdgVwDZ4CGweMABDFsaQLABQ9AAgMxmMBMZAqgM4xRl6Ab3pkxbVowCMSNijIBZGABcAFhAAmACl78yOPlACiWZQEtlATwCUo8SLrinZMwDMyWg/xPmrZALz+ZLgE1mQA9OHBEGQA7oRQWGZYAOZkrtBkfDAAtskpeJb6WLCEYKrU5MBQhFjlgo7OYg5NYgC+dk2dzgBuCVkB+oY+FpYAdAAqEADKylD5WtYA3BFR8Yn5ZADC0wAcSAAM7CBkACL8MK4XdeQQ7oRkAA4QPDxmJEUheGSwV7A3Y26HTobSAA=)

Why is there no warning on the seemingly unnecessary null test `if (userEntity == null) ...` or the apparently unreachable branch? 

It's because such tests are useful and encouraged in public APIs. Users should check inputs and the compiler should not get in the way of good practices. The branch of the `if` is therefore reachable.

Then, what is the state of `userEntity` within the `if` block? 

We take the user's null test seriously by considering `userEntity` to be maybe-null within the `if` block. So if the user did `userEntity.ToString()` inside the `if`, the compiler would rightly warn. This protects the user against a null reference exception that could realistically happen.

Given those, what should be the state of the `userEntity` at the exit of the `if`? 

Because we're merging branches where `userEntity` is maybe-null (when the condition of the `if` is true) and not-null (in the alternative), the state of `userEntity` is maybe-null. Therefore we warn on dereference on `userEntity` after the `if`.
Note that if the `if` block contained a `throw`, the `userEntity` would be considered not-null after the `if`. This is a common patter: `if (userEntity is null) throw new ArgumentNullException(nameof(userEntity));`.
