---
published: true
title: A skill to generate lessons on a topic
categories: [til]
permalink: /til/teach-skill-for-lessons.html
---

Matt Pocock created a [`/teach` skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach) for AI coding agents that generates interactive, self-contained HTML lessons on any topic.

I used it to generate a [short series of lessons on Elo rating systems](/archives/elo-lessons/0001-the-core-idea-behind-elo.html) (covering the formula, update rule, convergence, applications to LLM evaluation, Bayesian interpretation, and the Bradley-Terry model).

Aside from generating lessons, the artifacts include a cheatsheet and a template for keeping track of your progress (learning records) as you interact.

It would be great if the experience could be more integrated somehow. The agent doesn't see what how you answered quizzes in the lessons, it doesn't see the context (which page/paragraph you're on) when you ask it questions, and it lacks formalized spaced repetition system (like the one in [mnemonic medium demonstrated in Quantum Country](https://numinous.productions/ttft/)).

There's a lot of potential in interactive essays, and they are becoming easier to produce with AI. Here's a great one on [quantization](https://ngrok.com/blog/quantization)

References:
- [Learn anything with the /teach skill](https://www.youtube.com/watch?v=s5T5oQJcJ6U) — Matt's walkthrough video
