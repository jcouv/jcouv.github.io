---
published: true
title: Live HTML in Copilot CLI
categories: [til]
permalink: /til/live-html-in-copilot-cli.html
comments: False
---

In [How to extend Copilot CLI with custom UI](https://youtu.be/HcjUnrS41II), Steve Sanderson demonstrates how to create a Copilot CLI extension: a javascript module that runs within the CLI and adds tools the agent can call. One example opens a webview whose contents are controlled by the agent, such as a clock or a live stream of events from the Copilot harness.

Note: "extensions" are currently an experimental feature and need to be enabled with `/experimental on`.

He's also generalized this into a [webview creator](https://github.com/SteveSandersonMS/copilot-webview-creator) plugin. You install the plugin to get the skill, then invoke the skill to scaffold an extension for your needs. It includes useful module files as templates that can be included/reused in the resulting extension to save some work.

Note: a ["plugin"](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins) is an installable package that extends Copilot CLI with reusable agents, skills, hooks, and MCP/LSP configurations.