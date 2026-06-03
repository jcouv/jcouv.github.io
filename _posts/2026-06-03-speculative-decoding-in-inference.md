---
published: true
title: Speculative decoding in inference
categories: [til]
permalink: /til/speculative-decoding-in-inference.html
comments: False
---

[Speculative decoding](https://youtu.be/4Ij9YOyrNdM) is a clever technique to reduce the cost of inference by using a cheaper draft model for most of the work and the full target model to check it. The draft model proposes multiple tokens ahead, then the target model scores those proposed tokens in parallel.

The neat trick is that this can preserve the target model's sampling distribution, not just approximate it. For each drafted token, the verifier accepts it with probability `min(1, p_target / p_draft)`. If a token is rejected, the next token is sampled from the distribution left over after subtracting the draft model's proposal probabilities from the target model's probabilities.

This sampling correction means the output is distributed as if it came from the target model, while the speedup comes from accepting several cheap draft tokens per expensive target-model run. This works best when the draft and target models usually agree.
