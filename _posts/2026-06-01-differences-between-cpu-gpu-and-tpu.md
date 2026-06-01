---
published: true
title: Differences between CPU, GPU and TPU
categories: [til]
tags: [ai, hardware]
permalink: /til/differences-between-cpu-gpu-and-tpu.html
comments: False
---

This [blackboard presentation by Reiner Pope](https://youtu.be/oIk3R-sMX5o) walks through the basics of a multiply-accumulate (MAC) unit and explains the transistor cost of moving data around relative to doing arithmetic.

In a CPU, a lot of silicon is spent on general-purpose flexibility: control flow, caching, branch prediction, instruction scheduling, and routing data between many different kinds of operations. The arithmetic unit itself may be cheap compared with the surrounding machinery needed to keep a CPU broadly useful.

GPUs and TPUs shift that balance toward more computation per unit of control and data-movement overhead. GPUs do this through massive parallelism and high-throughput execution. TPUs go further for machine-learning workloads by using systolic arrays: grids of MAC units where data flows rhythmically through neighboring cells.

Systolic array design relies on two key ideas:

- A grid of MAC nodes lets partial sums flow through the grid in a regular pattern, "systolic" by analogy with blood pulsing through the heart.
- Weights can be preloaded into local registers or storage near the compute units, reducing repeated long-distance data movement once the array is filled.
