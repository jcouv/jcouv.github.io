---
published: true
title: Adversarial evaluation for long-running agents
categories: [til]
tags: [ai, agents]
permalink: /til/adversarial-agent-evaluation.html
comments: False
---

In [Build Agents That Run for Hours (Without Losing the Plot)](https://www.youtube.com/watch?v=mR-WAvEPRwE), Ash Prabaker and Andrew Wilson described a practical pattern for long-running coding agents: split planning, building, and evaluation into separate roles, and make the evaluator adversarial.

Takeaways:

- Self-evaluation is a trap. Use an adversarial evaluator.
- Compaction doesn't cure coherence drift. Structured handoffs do.
- Make subjective quality gradable with clear evaluation criteria the model can apply.
- Read the traces. They're your primary debugging loop.
- Delete scaffolding when the model catches up. The frontier moves.

Agents tend to take shortcuts when evaluating their own work, and they can be too agreeable. It helps to make evaluation a separate role: a skill or agent definition that specializes in QA, looks for missing cases, and refuses to accept success-shaped claims without evidence.

Examples include an [`evaluator` agent](https://github.com/jcouv/dotfiles/blob/main/.github/agents/evaluator.agent.md) and a [`csharp-design-evaluator` skill](https://github.com/jcouv/dotfiles/tree/main/copilot/skills/csharp-design-evaluator).

A practical way to make one is to ask an agent: "Create a skill to evaluate `<your problem space>`. Use `<link to an existing evaluator skill>` for tone and approach." Then refine the evaluation criteria, tighten the failure modes, and apply it to real outputs.
