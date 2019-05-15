---
title: Overview of nullability analysis
published: true
---

A regular Roslyn contributor, Yair, asked for some pointers about C# 8.0's nullability analysis on the [gitter](https://gitter.im/dotnet/roslyn) channel. I thought I'd expand on my reply and share more broadly.

This post assumes familiarity with the "nullable reference types" feature, including the concepts of nullability [annotations](https://github.com/dotnet/csharplang/blob/master/proposals/csharp-8.0/nullable-reference-types-specification.md#nullability-of-types) (annotated, not-annotated, oblivious) and [states](https://github.com/dotnet/csharplang/blob/master/proposals/csharp-8.0/nullable-reference-types-specification.md#null-state-and-null-tracking) (not-null, maybe-null).

## Bound tree

The backbone of the compiler consists of four main stages:
- _parsing_ source code into syntax trees,
- building symbols from declarations and _binding_ the syntax of each method body into an initial bound tree,
- _lowering_ the bound tree into a set of simpler bound nodes,
- _emitting_ IL from the lowered bound nodes, along with some metadata.

Nullability analysis rests on the initial bound tree. This tree has a structure similar to the syntax tree, but instead of referencing un-interpreted identifiers (like `x` or `Method`) it references symbols. Symbols are an object model for entities declared by a program or loaded from metadata. 
For example, symbols allow differentiating different uses of a given identifier in code. You could have a parameter `x`, a local `x`, a type `x` or even a method `x`. For each kind of symbol you can ask different questions, such as the type of the parameter or local, or the return and parameter types of a method.

When types are explicit in source (for example, `string nonNullLocal = "";`, `string? maybeNullLocal = "";` or `MakeArray<string?>(item)`), the bound nodes and symbols capture an explicit/declared nullability: `TypeWithAnnotations` with `Annotated` or `NotAnnotated` annotations in a [context](https://github.com/dotnet/csharplang/blob/master/proposals/csharp-8.0/nullable-reference-types-specification.md#nullable-contexts) with nullability annotations enabled, or `Oblivious` in a disabled context.
When types are inferred (for example, in `var local = "";` or `MakeArray(item)`), the bound node just uses an `Oblivious` annotation, which the nullability analysis will later revise.

## NullableWalker

[`NullableWalker`](https://github.com/dotnet/roslyn/blob/master/src/Compilers/CSharp/Portable/FlowAnalysis/NullableWalker.cs) is responsible for most of the analysis. It is a visitor for the initial bound tree, which:
1. computes the nullability state of expressions (and save those to answer queries from the IDE), 
2. keeps track of knowledge for different variables (more on that below), and 
3. produces warnings.

## State tracking

As the analysis progresses through a method body, `NullableWalker` tracks some knowledge for each variable (or more generally, storage location). At a certain point in the analysis, the state for a given variable is either `MaybeNull` or `NotNull`.
For all the tracked variables, this is represented as a state array, in which each variable gets an index/position/slot.

For instance, each parameter and local in a method gets a slot, which holds either a `NotNull` or `MaybeNull` state. Consider a parameter `string? p1`: we give it a slot/index and we'll initialize its state to maybe-null (ie. `State[slot] = MaybeNull`, because its declared type is `Annotated`), then when we visit `p1 = "";` we can just override that state, and when we visit `p1.ToString()` we consult that state to decide whether to warn for possible null dereference.

`NullableWalker` not only tracks variables, it also tracks fields within structs, so it also assigns slots for those. That way, it can warn on `localStruct.field1.ToString()`, but not `localStruct.field2.ToString()` independently.
Slots are related to each other, so that when assigning `local2 = local1;` we can not only copy the slot for `local1`to set the state of `local2`, but we can copy the nested slots thereby transfering all of our knowledge of `local1` to `local2`.

The state is generally just a simple array, but it can also be two arrays in some cases. That's called "conditional state". It is used for analyzing expressions like `x == null`. We keep track of the states "if the expression were true" and "if the expression were false" separately. Slots are still used to index into those arrays as normal.

Another operation that is common is that of cloning states. When analyzing `if (b) ... else ...`, we clone the state so that we can analyze each branch separately. The states at the end of the branches are then merged when the branches rejoin (`Meet` takes the worst case values).

In code that isn't reachable, as in `if (false) { ... unreachable ...}`, every value you read is `NotNull` regardless of tracked state.

## Simple example

Let's wrap up this overview by looking at an assignment, `x = y`. To analyze this expression, we're going to:
1. visit the right-hand-side expression and get a `TypeWithState` back which tells us the null-state of `y` at this point in the program,
2. visit the left-hand-side expression as an L-value (i.e., for assigning to) and get a `TypeWithAnnotations` back which tells us the declared type of `x` (not its state),
3. we check if the assignment from the state of `y` to the declared type of `x` poses problems, both in terms of top-level nullability (for instance, are we assigning a `null` value to a un-annotated `string` variable?), or nested nullability (for example, are we assigning a `List<string>` value to a `List<string?>` variable?),
4. we update the state of `x` based on the state of `y`, 
5. return the state of `x` as the state of the assignment expression, in case it is a nested expression like `(x = y).ToString()`.

In that example, `y` might not be a simple bound node for accessing `y`, but it could also involve implicit conversions. In that case, visiting `y` at the step (1) will visit a bound conversion which holds `y` as its operand. As long as the visit operation for each kind of bound node does its part (i.e., produce a `TypeWithState` for the expression, produce proper side effects on state and diagnostics) then this process composes well.
