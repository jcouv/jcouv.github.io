---
published: false
---
## ValueTuple availability on various platforms

As part of VS2017, we have just release C# and VB support for tuples, which Mads describes in the [C# 7.0 annoucement post](https://blogs.msdn.microsoft.com/dotnet/2017/03/09/new-features-in-c-7-0/).

Under the covers, tuples are lowered into `ValueTuple` types of various arities and nesting, and tuple element names are stored in `TupleElementNamesAttribute`. Vlad describes both in details in ["How tuples relate to ValueTuple"](http://mustoverride.com/tuples_valuetuple/) and ["More about tuple element names"](http://mustoverride.com/tuples_names/).

Since the prototyping work for tuples began, we not only focused on language questions, but more generally the end-to-end experience using tuples. Central to that experience is how to make the `ValueTuple` types available.

Our approach has been two-pronged:
1. provide a ValueTuple nuget package with support with existing frameworks
2. migrate ValueTuple and other types into core libraries as new frameworks ship



