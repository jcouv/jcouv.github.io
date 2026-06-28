---
published: true
title: A file-based C# framework for multi-agent workflows
categories: [til]
permalink: /til/agent-workflow-framework.html
comments: False
---

The problem: even when using subagents for the heavy lifting, agents are still somewhat unreliable at following workflow instructions.

The common solution is to have a hard control loop outside of the agent. After writing variations on a [Ralph loop](https://github.com/jcouv/dotfiles/tree/main/copilot/ralph), I got thinking about how to generalize this pattern to arbitrary workflows.  

In particular, how to make it as easy as possible for an agent to write such orchestration code?  
The answer is using a strongly-typed language and a well-suited set of APIs, to provide guidance and guardrails.  
So I wrote a small C# framework to help.

Each agent is defined as a type (derived from either `AgentAction<TSelf, TInput>` or `AgentAction<TSelf, TInput, TOutput>`) with a `string Prompt()` override, strongly-typed inputs and outputs, and an optional `ValidateOutput` override.  
For example, the output for a simple evaluator `class EvaluatorAgent: AgentFunc<EvaluatorAgent, EvaluatorInput, EvaluatorOutput>` would be a boolean status (was the submission accepted or not) and a string for feedback if some problems were found.  
The agent is then available to the workflow as a regular async strongly-typed method to call.  
For example, `EvaluatorOutput evaluation = EvaluatorAgent.Invoke(evaluatorInput);`.  
The framework handles the invocation and the deserialization of the result.

This would allow you to write something like the following:
```cs
while (GetNextChecklistItem(out var workItem))
{
    bool accepted = false;
    string feedback = "";

    do
    {
        BuilderAgent.Invoke(workItem, feedback);

        var evaluation = EvaluatorAgent.Invoke();
        accepted = evaluation.IsAccepted
        feedback = evaluation.Feedback;
    }
    while (!accepted)

    item.MarkCompleted();
}
```

This is a nice start, but quickly hits a problem: you need the workflow to be durable and resumable, so it can be interrupted and resumed as you refine the prompts and the workflow structure.  
The framework makes it easy for the workflow to persist state changes after each agent invocation.  

With this framework, the agent is guided to write:
1. a file-based C# program (`workflow.cs`) with agent definitions (a prompt, and input and output types), and the workflow (as an `async` method and a type for the workflow state)
2. a `state.json` file which is both the starting point and a resumable checkpoint for the workflow

The workflow is then run with `dotnet run workflow.cs`.  
The accompanying skill provides some examples (Ralph loop, builder & evaluator loop).

Source: [create-agent-workflow skill](https://github.com/jcouv/dotfiles/blob/main/copilot/skills/create-agent-workflow/SKILL.md)
