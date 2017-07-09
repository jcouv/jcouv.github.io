---
published: false
title: Using C# 7.1
---

C# 7.0 was released as part of Visual Studio 2017. While we started working on C# 8.0, we will also ship features that are ready sooner as point releases.
C# 7.1 is the first such release. It will ship along with Visual Studio 2017 version 15.3. Thanks to the revamped install experience, you can now quickly and safely [install the Visual Studio Preview](https://www.visualstudio.com/vs/preview/).
As you start using new C# 7.1 features in your code, a lightbulb will offer you to upgrade your project, either to "C# 7.1" or "latest". If you leave your project's language version set to "default", you can only use C# 7.0 features ("default" means the latest major version, so does not include point releases).

Screenshot for lightbulb
Screenshot for language version

# Details on features
## async Main
This makes it easier to get started with async code, by recognizing `static async Task Main() {...await some asynchronous code...}` as a valid entry-point to your program.

## "default" expressions
This lets you omit the type in the default operator (`default(T)`) when the type can be inferred from the context. For instance, you can invoke `void M(ImmutableArray<int> x)` as `M(default)`, or defined a default parameter value when declaring `void M(ImmutableArray<int> x = default)`. 

The IDE will suggest simplifying (screenshot)

## Inferred tuple names
This is a refinement on tuple literals (introduced in 7.0), which makes tuple element names redundant when they can be infered from the expressions.
Instead of writing `var tuple = (a: this.a, b: X.Y.b)`, you can simply write `var tuple = (this.a, X.Y.b);`. The elements `tuple.a` and `tuple.b` will still be recognized.


pattern-matching with generics

Details various integrations (ASP.NET and such), including info about packages (2.3)
Giving feedback

You can find more details about C# 7.1 and our progress on C# 7.2 and 8.0 in the [language feature status page](https://github.com/dotnet/roslyn/blob/master/docs/Language%20Feature%20Status.md).

