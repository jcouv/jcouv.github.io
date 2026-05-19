---
published: true
title: Pocock's handoff skill for AI sessions
categories: [til]
tags: [ai, agents]
permalink: /til/pocock-handoff-skill.html
comments: False
---

Matt Pocock has a small [`handoff` skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md) for compacting an AI coding session so another agent can pick it up later.

The useful bit is that the handoff is not just "summarize the chat". It asks the agent to write a temporary handoff document for a fresh agent, suggest relevant skills for the next session, and avoid duplicating details already captured in durable artifacts such as plans, PRDs, issues, commits, and diffs.

That framing makes the handoff more operational: point at durable state, capture only the missing context, and tailor the note to what the next session is supposed to do.
