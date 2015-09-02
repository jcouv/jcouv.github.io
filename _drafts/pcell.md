---
layout: post
title: pCell technology
published: false
---


# Personal cell

I've been keeping an eye on the pCell technology since the original annoucement. I'll share an overview of the problem and solution. It should become obvious why I find technology exciting.   

There are multiple problems with traditional cellular and wireless networks: devices within a cell share bandwidth to the antenna, devices further away from the antenna get a weaker signal, and devices between two antennas suffer interferences.  
The standard solution is create more and smaller cells (each covering a smaller area). But this is tricky as different cells interfere, which results in uneven coverage and data rates.  

Here's what I pieced together of the pCell solution:  
A server controls a number of antennas and keeps track of the distance (latency) between each device and each antenna. When it wants to send a message a specific device, it adds that message to the signal of each antenna with compensating delay. The result is that that message will constructively interfere at the location of the target device.  
The message can use whatever protocol the device expects and understands (this works with your existing phone). This "personal cell" (pCell) is apparently smaller than a cubic centimeter, allowing for great proximity/density of devices.  

For outgoing messages from the device, the server applies compensating delay to the signals received by each antenna and adds them up. This reconstructs the message sent by that particular device. The same process is applied for each tracked device.  
When devices move, their distance (latency) to each antenna changes and the server needs to keep track of that. I don't have a good understand of how they solved that, but apparently their approach relies on the Doppler effect.  


This diagram (with added annotation) summarizes the impact of pCell on users in a San Francisco simulation:  

![pCell.PNG]({{site.baseurl}}/archives/images/pCell.PNG)

There are two topologies modeled (one based on 32 Sprint towers, and the other based on 220 random locations). The top row shows pCell in two frequency ranges and the bottom row shows LTE with 4x4 and 8x8 MIMO. The take-away is that the distribution of bandwidth per user is expected to shift closer to the peak. 


I still don't know how the pCell design can be reconciled with Shannon's channel limit, or how the issue is sidestepped. Some folks doubt this could even work at all, despite the [demos](https://www.youtube.com/channel/UCgDns8O1TwKMoSuG0JTaVQA/videos).
I'm pretty excited about the potential benefits detailed in their [whitepaper](http://www.rearden.com/artemis/An-Introduction-to-pCell-White-Paper-150224.pdf): increased and more uniform bandwidth using less power. So I can't wait to see the real-world results and reviews.  





https://www.youtube.com/watch?v=1QxrQnJCXKo
https://www.youtube.com/watch?v=wGAnDQEQJ_s
https://youtu.be/NKFyCOoo5Y4?t=26m16s




