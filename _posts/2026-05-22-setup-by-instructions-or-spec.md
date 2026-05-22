---
published: true
title: Setup by instructions or spec
categories: [til]
tags: [ai, agents]
permalink: /til/setup-by-instructions-or-spec.html
comments: False
---

When trying a new repo, it is useful to ask an agent to do the setup as a troubleshooting exercise: read the docs, install the prerequisites, run the expected commands, and debug the errors that come up.

That also suggests a useful design constraint for projects: setup can be expressed as textual instructions rather than hidden inside setup scripts. If an agent can follow the instructions from a clean checkout, the docs are probably good enough for a human too.

You can push the same idea further and make the product itself generated from a spec. OpenAI's [`symphony`](https://github.com/openai/symphony) is an example of a repository shaped around that kind of spec-driven generation.
