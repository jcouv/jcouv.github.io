---
published: true
title: Quantized KV cache
categories: [til]
permalink: /til/quantized-kv-cache.html
comments: False
---

The KV cache grows with the context window and can consume significant memory during inference. [KIVI](https://arxiv.org/abs/2402.02750) evaluates several ways to quantize it.

Quantization needs a value range, so we first need to collect minimum and maximum values. This raises two questions: which slice of the cache should determine the range  and how can the range be computed as the cache is streamed from memory?

The authors noticed that the distributions of keys and values differ greatly. For keys, a few fixed channels have very large magnitudes, while the remaining channels are relatively normal. Values tend tend to be more grouped by token.
So the paper finds that the best configuration uses per-channel quantization for keys (compute one min/max range for a feature across many tokens) and per-token quantization for values (compute one min/max range for all features in a single token's vector).

The proposed streaming design keeps the most recent portion of the KV cache unquantized in a residual buffer, which helps preserve model accuracy.
As the buffer fills, its oldest entries are quantized and moved into the compressed cache in fixed-size groups, while newly arriving entries continue accumulating in full precision.
This gives per-channel key quantization enough tokens to compute a range without waiting for the entire cache, which is still growing during generation.
