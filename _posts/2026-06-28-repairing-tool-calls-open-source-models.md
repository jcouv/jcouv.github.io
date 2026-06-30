---
published: true
title: Repairing tool calls by open source models
categories: [til]
permalink: /til/repairing-tool-calls-open-source-models.html
comments: False
---

Ahmad Awais wondered why people were reporting such wildly different experiences with open source models, and why so many complained those models were bad at tool calling.  
By analyzing traces from CommandCode, he noticed the models made simple, recurring tool-calling mistakes. Worse, they would keep repeating the same bad pattern even after being handed the error message from previous bad tool calls.

He experimented with patching the broken tool call inside the harness. Since repairing a call sometimes means guessing missing values, the harness folds an explanation into the tool response, essentially "your call was invalid in these ways, we used this corrected call instead, and here's the result."  
That feedback does double duty. It lets the model judge whether the corrected result is actually what it wanted, and it nudges the model toward producing better tool calls later in the session.  

Having the harness rescue the model from those simple mistakes brought DeepSeek 4 Pro performance in line with Opus 4.7.

References: [video](https://youtu.be/f61DCDwvFis), [thread](https://x.com/MrAhmadAwais/status/2050956678502420612)
