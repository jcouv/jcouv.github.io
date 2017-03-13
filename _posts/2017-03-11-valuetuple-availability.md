---
published: false
title: ValueTuple availability on various platforms
---

As part of VS2017, we have just released C# and VB support for tuples, which Mads describes in the [C# 7.0 announcement post](https://blogs.msdn.microsoft.com/dotnet/2017/03/09/new-features-in-c-7-0/). 

Under the covers, C#/VB tuples and corresponding [F# 4.1 "struct tuples"](https://blogs.msdn.microsoft.com/dotnet/2016/07/25/a-peek-into-f-4-1/) are lowered into `ValueTuple` types of various arities and nesting, and tuple element names are stored in `TupleElementNamesAttribute`. Vlad describes both in some details in ["How tuples relate to ValueTuple"](http://mustoverride.com/tuples_valuetuple/) and ["More about tuple element names"](http://mustoverride.com/tuples_names/).

Since the early prototyping work for tuples, we not only focused on language questions, but more generally the end-to-end experience of tuples. Central to that experience is how to make the `ValueTuple` types available. 

Without those types, the compilation will fail and reports ``error CS8179: Predefined type 'System.ValueTuple`2' is not defined or imported``.

In order to maximize scenarios were you can use tuples, we took a two-pronged approach:

1. provide [System.ValueTuple nuget package](https://www.nuget.org/packages/System.ValueTuple) with support with existing frameworks,
2. migrate ValueTuple and other types into core libraries as updated frameworks ship.

Naturally, a common question is: how soon can I use tuples without referencing this additional ValueTuple package?

Here is the latest status on migrating `ValueTuple` types into frameworks (as of March 2017):

| Framework | Version that includes ValueTuple |
|-----------|----------------------------------|
| Full/desktop framework | [Windows 10 Creators Edition Update (RS2)](https://answers.microsoft.com/en-us/windows/wiki/windows_10-windows_install/windows-10-creators-edition-update-how-to-get-it/729be3d2-0d9f-4ac5-8a77-66beef65c55d) |
| Core | 2.0 (with planned preview in Q2 2017, release in Q3, see [roadmap](https://github.com/dotnet/core/blob/master/roadmap.md)) |
| Mono | Mono 5.0 |
| .Net Standard | .Net Standard 2.0 | 

For older frameworks, the ValueTuple package should help fill the gap, including targets for `netstandard1.0` and `portable-net40+sl4+win8+wp8` (for Portable Class Libraries). I will keep the package updated as the migration into core libraries progresses, to provide as smooth and transparent an experience as possible.

This picture is further complicated as the `ValueTuple` types receive some minor updates (such as binary serializability). Such improvements will not be available to users of the ValueTuple package; they will only be implemented in frameworks themselves.

I keep track of all the library work related to `ValueTuple` types in this [work items list](https://github.com/dotnet/roslyn/issues/13177). But if you have a specific question, it is probably easier to ask me directly in the comments section. Bug reports should go in the [corefx](https://github.com/dotnet/corefx/issues/new) github repo.

Known issues:
- Degraded QuickWatch experience when debugging an application compiled on the full framework 4.6 or earlier on a machine with 4.7 installed. See issue [details](https://github.com/dotnet/corefx/issues/16195). This will be mitigated in first quarterly release of VS2017 and expected to be fully fixed in 4.7.1.
