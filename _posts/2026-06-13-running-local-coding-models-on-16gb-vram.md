---
published: true
title: Running local coding models on 16GB VRAM
categories: [til]
permalink: /til/running-local-coding-models-on-16gb-vram.html
comments: False
---

I've been able to run local coding models on a 16GB VRAM GPU.

The general pattern is to use quantized models.
The newer `I` quantizations, such as `IQ3_S` and `IQ4_XS`, are generally better than older quantization schemes at the same bit rate.
Some Gemma 4 builds are quantized from quantization-aware-trained ([QAT](https://unsloth.ai/docs/models/gemma-4/qat)) models, which can reduce the impact from quantization.

Mixture-of-experts (MoE) models are also helpful for local performance because only part of the model is active per token. For example, `A3B` indicates that roughly 3B parameters are activated, so a much larger total-parameter model can still have practical tokens/sec on local hardware.

As I'd [mentioned earlier](/til/speculative-decoding-in-inference.html), for some models it possible to boost performance with speculative decoding. Thats "multi-token prediction" ([MTP](https://unsloth.ai/docs/models/mtp)) in the last model. That uses more VRAM since two models run, so I'm using a smaller model (12B instead of 26B).

One working `llama-server` setup for [Qwen3.6 35B quantized with IQ3_S](https://huggingface.co/byteshape/Qwen3.6-35B-A3B-GGUF) is:

```powershell
llama-server -hf byteshape/Qwen3.6-35B-A3B-GGUF:IQ3_S `
    --ctx-size 128000 `
    --n-gpu-layers all `
    --device Vulkan0 `
    --threads 32 `
    --threads-batch 32 `
    --fit off `
    --flash-attn on `
    --no-mmproj `
    --cont-batching `
    --cache-idle-slots `
    --parallel 1 --cache-type-k q8_0 --cache-type-v q8_0
```

[Gemma 4 26B quantized with IQ4_XS](https://huggingface.co/bartowski/google_gemma-4-26B-A4B-it-GGUF) also works:

```powershell
llama-server -hf bartowski/google_gemma-4-26B-A4B-it-GGUF:IQ4_XS `
    --ctx-size 128000 `
    --n-gpu-layers all `
    --device Vulkan0 `
    --threads 32 `
    --threads-batch 32 `
    --fit off `
    --flash-attn on `
    --no-mmproj `
    --cont-batching `
    --cache-idle-slots `
    --parallel 1 --cache-type-k q8_0 --cache-type-v q8_0
```

I also tried [Gemma 4 12B QAT model with draft-MTP speculative decoding](https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF):

```powershell
llama-server `
    -hf unsloth/gemma-4-12B-it-qat-GGUF:UD-Q4_K_XL `
    --spec-type draft-mtp --spec-draft-n-max 2 `
    --ctx-size 128000 `
    --n-gpu-layers all `
    --device Vulkan0 `
    --threads 32 `
    --threads-batch 32 `
    --flash-attn on `
    --fit on `
    --no-mmproj `
    --cont-batching `
    --cache-idle-slots `
    --parallel 1
```


I'll report on how well they work on various tasks once I have more hands-on experience. In the mean time, here's the throughput on some simple tasks:
| Model | Avg tok/s |
|-------|-----------|
| Qwen3.6-35B (IQ3_S) | 144.7 |
| Gemma4-26B (IQ4_XS) | 84.1 |
| Gemma4-12B+MTP (Q4_K_XL) | 146.3 |

Some key flags are:

- `-hf`: downloads the model directly from Hugging Face.
- `--ctx-size 128000`: requests a large context window.
- `--n-gpu-layers all`: offloads every layer to the GPU.
- `--device Vulkan0`: selects a specific GPU when multiple are available.
- `--fit off`: avoids automatically shrinking the context to fit memory.
- `--fit on`: allows `llama-server` to adjust the requested configuration to fit available memory.
- `--flash-attn on`: enables flash attention, a more memory-efficient attention kernel that helps with long contexts.
- `--no-mmproj`: skips loading a multimodal projector (saves VRAM).
- `--spec-type draft-mtp --spec-draft-n-max 2`: enables [draft-MTP speculative decoding](/til/speculative-decoding-in-inference.html) with up to two draft tokens.
- `--parallel 1`: limits concurrent sequence slots (predictable VRAM usage).
- `--cache-type-k q8_0 --cache-type-v q8_0`: quantizes the KV cache.

On a 16GB card, it also matters what else is using the GPU. Other processes can consume and fragment VRAM, so a model or context size that fits after a reboot may fail later if browsers, editors, games, or other GPU workloads have already allocated memory.

I'll probably try [TurboQuant](https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/) next. It's a recent Google Research paper about extreme compression for vectors and LLM KV caches. It is being prototyped, but is not shipped in `llama.cpp` yet.

To make these models available in VS Code chat (with "bring your own key/model" support), configure `chatLanguageModels.json` with the local endpoints:

```json
[
    {
        "name": "llama.cpp",
        "vendor": "customendpoint",
        "apiType": "chat-completions",
        "models": [
            {
                "id": "local-model",
                "name": "llama.cpp",
                "url": "http://localhost:8080/v1/chat/completions",
                "toolCalling": true,
                "maxInputTokens": 128000,
                "maxOutputTokens": 16000
            }
        ]
    }
]
```
Sadly, the VS Code Agents app and GitHub Copilot app don't yet support BYOK.
