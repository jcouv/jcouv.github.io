---
layout: post
title: pCell technology
published: false
---


# Personal cell

I've been keeping an eye on the pCell technology since the original annoucement. I'll share an overview of the problem and solution. It should become obvious why I find technology exciting.   

The problem is that normal wireless networks share bandwidth across devices within the area covered by one antenna (cell). The more devices you add and the less bandwidth they each receive.  
The standard solution is create more and smaller cells (each covering a smaller area). But this is tricky as different cells interfere, which results in uneven coverage and data rates.  

Here's my understanding of the pCell solution:  
A server controls a number of antennas and keeps track of the distance (latency) between each device and each antenna. When it wants to send a message a specific device, it adds that message to the signal of each antenna with compensating delay. The result is that that message will constructively interfere at the location of the target device.  
The message can use whatever protocol the device expects and understands (this works with your existing phone). This "personal cell" (pCell) is apparently smaller than a cubic centimeter, allowing for great proximity/density of devices.  

For outgoing messages from the device, the server applies compensating delay to the signals received by each antenna and adds them up. This reconstructs the message sent by that particular device. The same process is applied for each tracked device.  
When devices move, their distance (latency) to each antenna changes and the server needs to keep track of that. I don't have a good understand of how they solved that, but apparently their approach relies on the Doppler effect.  


Whether or how such a design can be compatible with Shannon's channel limit was a major concern. I'm not sure how it was resolved or sidestepped. I'm guessing there are still limits to how many signals you can add up, given that each channel has a power limit.   
But, judging from the [latest demos](https://www.youtube.com/channel/UCgDns8O1TwKMoSuG0JTaVQA/videos) and [whitepaper](http://www.rearden.com/artemis/An-Introduction-to-pCell-White-Paper-150224.pdf), the pCell approach does seem to significantly improve over standard cellular and MIMO technology. Their first product is apparently released to select partners for trial, so I can't wait to see the real-world results and reviews.  

https://www.youtube.com/watch?v=1QxrQnJCXKo
https://www.youtube.com/watch?v=wGAnDQEQJ_s




