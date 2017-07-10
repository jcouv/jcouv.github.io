---
published: false
title: Using C# 7.1
---

C# 7.0 was released as part of Visual Studio 2017 (version 15.0). While we started working on C# 8.0, we will also ship features that are ready earlier as point releases.
C# 7.1 is the first such release. It will ship along with Visual Studio 2017 version 15.3. To get started today, you can [install the Visual Studio Preview](https://www.visualstudio.com/vs/preview/) side-by-side, quickly and safely.

As you start using new C# 7.1 features in your code, a lightbulb will offer you to upgrade your project, either to "C# 7.1" or "latest". If you leave your project's language version set to "default", you can only use C# 7.0 features ("default" means the latest major version, so does not include point releases).

Here are more specific instructions for using C# 7.1 in [ASP.NET and ASP.NET Core](https://github.com/dotnet/roslyn/issues/18783#issuecomment-308510444) and [.NET CLI](https://github.com/dotnet/roslyn/issues/18783#issuecomment-308516907). The NuGet compiler packages for this release are [versioned](https://github.com/dotnet/roslyn/wiki/NuGet-packages#versioning) 2.3.

You can provide feedback on the C# features on the [Roslyn repository](https://github.com/dotnet/roslyn/issues/new) or via the "Report a Problem" button in Visual Studio.

Screenshot for lightbulb
Screenshot for language version

# C# 7.1 features
In addition to [numerous issues](https://github.com/dotnet/roslyn/issues?q=is%3Aissue+milestone%3A15.3+label%3AArea-Compilers+is%3Aclosed) fixed in this release, the compiler comes with the following features for C# 7.1 (summarized below): async Main, "default" expressions, inferred tuple names, and pattern-matching with generics.
You can find more details about C# 7.1 and our progress on C# 7.2 and 8.0 in the [language feature status page](https://github.com/dotnet/roslyn/blob/master/docs/Language%20Feature%20Status.md).

## async Main
This makes it easier to get started with async code, by recognizing `static async Task Main() {...await some asynchronous code...}` as a valid entry-point to your program.

## "default" expressions
This lets you omit the type in the default operator (`default(T)`) when the type can be inferred from the context. For instance, you can invoke `void M(ImmutableArray<int> x)` with `M(default)`, or specify a default parameter value when declaring `void M(CancellationToken x = default)`. 

The IDE will suggest simplifying (screenshot)

## Inferred tuple names
This is a refinement on tuple literals (introduced in 7.0), which makes tuple element names redundant when they can be infered from the expressions.
Instead of writing `var tuple = (a: this.a, b: X.Y.b)`, you can simply write `var tuple = (this.a, X.Y.b);`. The elements `tuple.a` and `tuple.b` will still be recognized.

## Pattern-matching with generics
This allows using open types in type patterns. For example, `case T t:`.



