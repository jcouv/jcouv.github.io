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
- Make subjective quality gradable with rubrics the model can apply.
- Read the traces. They're your primary debugging loop.
- Delete scaffolding when the model catches up. The frontier moves.
