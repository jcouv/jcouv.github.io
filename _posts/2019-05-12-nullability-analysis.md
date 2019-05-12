---
title: Overview of nullability analysis
published: false
---

TODO Concept of bound tree and NullableWalker

NullableWalker visits bound nodes from initial binding to:
1. compute the nullability of expressions (and save those for semantic model), 
2. keep track of knowledge for different variables (more on that below), and 
3. produce warnings.

When nullability is explicit in source (for example, `string local = "";` or `string? local = "";`), the bounds nodes capture some declared nullability (`TypeWithAnnotations` with `Annotated` or `NotAnnotated` annotations). When nullability would require inference (for example, in `var local = "";` or `MakeArray(item)`), the initial bound node just uses an `Oblivious` annotation.

As the analysis progresses through a method body, `NullableWalker` tracks some knowledge for each variable (or more generally, storage location). For a given variable, the state is either `MaybeNull` or `NotNull`.
For all the tracked variables, this is represented as a state array, in which each variable gets an index/position/slot.

For instance, parameters and locals in a method get slot, which holds either non-null or maybe-null state. Consider a parameter `string? p1`, we give it a slot/index and we'll initialize its state to maybe-null (ie. `State[slot] = MaybeNull`, because its declared type is `Annotated`), then when we visit `p1 = "";` we can just override that state, and when we visit `p1.ToString()` we consult that state to decide whether to warn for possible null dereference.

`NullableWalker` tracks fields within structs, so it also assigns slots for those. That way, it can warn on `localStruct.field1.ToString()`, but not `localStruct.field2.ToString()` independently.
Slots are related to each other, so that when assigning `local2 = local1;` we can not only copy the slot for `local1`to set the state of `local2`, but we can copy the nested slots thereby transfering all of our knowledge of `local1` to `local2`.

The state is generally just a simple array, but it can also be two arrays in some cases. That's called "conditional state". It is used for analyzing expressions like `x == null`. We keep track of the states "if the expression were true" and "if the expression were false" separately. Slots are still used to index into those arrays as normal.

Another operation that is common is that of cloning states. If you analyze `if (b) ... else ...`, then we clone the state so that we can analyze each branch separately. Then there are rules for merging states when the branches rejoin (`Meet` takes the worst case values).

There are rules for branches that are not reachable `if (false) { ... unreachable ...}`. In such unreachable code, every value you read is `NotNull` regardless of current state.


