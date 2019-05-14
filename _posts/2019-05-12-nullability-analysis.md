---
title: Overview of nullability analysis
published: false
---

A regular contributor asked for some pointers about C# 8.0's nullability analysis on the [gitter](https://gitter.im/dotnet/roslyn) channel. I thought I'd expand them and share more broadly.

This post assumes familiarity with the feature, including nullability [annotations](https://github.com/dotnet/csharplang/blob/master/proposals/csharp-8.0/nullable-reference-types-specification.md#nullability-of-types) (annotated, not-annotated, oblivious) and [states](https://github.com/dotnet/csharplang/blob/master/proposals/csharp-8.0/nullable-reference-types-specification.md#null-state-and-null-tracking) (not-null, maybe-null).

## Bound tree

The backbone of the compiler consists of four main stages:
- _parsing_ source code into a syntax tree,
- _binding_ the syntax of each method body into an initial bound tree,
- _lowering_ the bound tree into a set of simpler bound nodes,
- _emitting_ IL from the lowered bound nodes, along with some metadata.

Nullability analysis rests on the initial bound tree. This tree composed of bound nodes and has a structure similar to the syntax tree, but instead of referencing un-interpreted identifiers (like `x` or `Method`) it references symbols. Symbols are an object model that allow differentiating different uses of a given identifier in code. You could have a parameter `x`, a local `x`, a type `x` or even a method `x`. For each kind of symbol you can ask different questions, such as the type of the parameter or local, or the return and parameter types of a method.

When types are explicit in source (for example, `string nonNullLocal = "";`, `string? maybeNullLocal = "";` or `MakeArray<string?>(item)`), the bound nodes and symbols capture an explicit/declared nullability: `TypeWithAnnotations` with `Annotated` or `NotAnnotated` annotations in a [context](https://github.com/dotnet/csharplang/blob/master/proposals/csharp-8.0/nullable-reference-types-specification.md#nullable-contexts) with nullability annotations enabled, or `Oblivious` in a disabled context.
When types are inferred (for example, in `var local = "";` or `MakeArray(item)`), the bound node just uses an `Oblivious` annotation, which the nullability analysis will later revise.

## NullableWalker

`NullableWalker` is responsible for most of the analysis. It is a visitor for the initial bound tree, which:
1. computes the nullability state of expressions (and save those to answer queries from the IDE), 
2. keeps track of knowledge for different variables (more on that below), and 
3. produces warnings.

## State tracking

As the analysis progresses through a method body, `NullableWalker` tracks some knowledge for each variable (or more generally, storage location). At a certain point in the analysis, the state for a given variable is either `MaybeNull` or `NotNull`.
For all the tracked variables, this is represented as a state array, in which each variable gets an index/position/slot.

For instance, parameters and locals in a method get slot, which holds either non-null or maybe-null state. Consider a parameter `string? p1`, we give it a slot/index and we'll initialize its state to maybe-null (ie. `State[slot] = MaybeNull`, because its declared type is `Annotated`), then when we visit `p1 = "";` we can just override that state, and when we visit `p1.ToString()` we consult that state to decide whether to warn for possible null dereference.

`NullableWalker` not only tracks variables, it also tracks fields within structs, so it also assigns slots for those. That way, it can warn on `localStruct.field1.ToString()`, but not `localStruct.field2.ToString()` independently.
Slots are related to each other, so that when assigning `local2 = local1;` we can not only copy the slot for `local1`to set the state of `local2`, but we can copy the nested slots thereby transfering all of our knowledge of `local1` to `local2`.

The state is generally just a simple array, but it can also be two arrays in some cases. That's called "conditional state". It is used for analyzing expressions like `x == null`. We keep track of the states "if the expression were true" and "if the expression were false" separately. Slots are still used to index into those arrays as normal.

Another operation that is common is that of cloning states. If you analyze `if (b) ... else ...`, then we clone the state so that we can analyze each branch separately. Then there are rules for merging states when the branches rejoin (`Meet` takes the worst case values).

There are rules for branches that are not reachable `if (false) { ... unreachable ...}`. In such unreachable code, every value you read is `NotNull` regardless of current state.


Mention notion of conservative assumptions
