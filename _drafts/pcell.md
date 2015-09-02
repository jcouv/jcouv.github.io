---
layout: post
title: pCell technology
published: false
---


I've been keeping an eye on the pCell technology since Steve Perlman's original annoucement. It's a wireless technology which, if it works, could offer significantly increased and more uniform bandwidth to mobile devices. 

There are problems with traditional cellular and wireless networks: (1) devices within a cell share bandwidth to the antenna, (2) devices further away from the antenna get a weaker signal, and (3) devices between two antennas suffer interferences.  
The standard solution is create more and smaller cells (each covering a smaller area). But this is tricky as different cells interfere, which results in uneven coverage and data rates.  

I've collected clues on the pCell solution from various videos (some of which I linked below and some which I can't seem to find anymore), and here's what I pieced:  
A server controls a number of antennas and keeps track of the distance (latency) between each device and each antenna. When the server wants to send a message a specific device, it adds that message/waveform to the signal of each antenna with compensating delay. The result is that that message will constructively interfere at the location of the target device, while those not meant for this device will destructively interfere.  
The message can use whatever protocol the device expects and understands (this works with your existing phone). This "personal cell" (pCell) is apparently smaller than a cubic centimeter, allowing for great proximity/density of devices.  

For outgoing messages from the device, the server applies compensating delay to the signals received by each antenna and adds them up. This reconstructs the message sent by that particular device. The same process is applied for each tracked device.  

When a device move, its distance (latency) to each antenna changes and the server needs to keep track of that. This is key and probably the most difficult part of the problem. Sadly I don't remember this being explained in any details, except maybe for a mention of the Doppler effect.  


This diagram (with added annotation) shows the simulated impact of pCell on users in a San Francisco model:  

![pCell.PNG]({{site.baseurl}}/archives/images/pCell.PNG)

There are two topologies considered: one based on 32 Sprint towers, and the other based on 220 random locations. The top row shows pCell in two frequency ranges and the bottom row shows LTE with 4x4 and 8x8 MIMO. The take-away is that the distribution of bandwidth per user is expected to shift closer to the peak.  
If it works as described in their [early 2015 whitepaper](http://www.rearden.com/artemis/An-Introduction-to-pCell-White-Paper-150224.pdf), the benefits would be increased and more uniform bandwidth using less power. 


I still don't know how the pCell design can be reconciled with Shannon's channel limit, or how the issue is sidestepped. Some folks [doubt this could even work at all](http://www.quora.com/Is-pCell-from-Artemis-really-the-Holy-Grail-of-wireless-networking), despite the [demos](https://www.youtube.com/channel/UCgDns8O1TwKMoSuG0JTaVQA/videos). The good news is that they released their first product for selected trials in Feb 2015, so I'm hoping for some real-world results and reviews. 



https://www.youtube.com/watch?v=Lv-vkBNzZwE (demonstrates the size of a pCell)

https://www.youtube.com/watch?v=1QxrQnJCXKo (Columbia 2011)
https://www.youtube.com/watch?v=wGAnDQEQJ_s (Stanford 2014) 
https://youtu.be/NKFyCOoo5Y4?t=26m16s (Columbia 2011)
http://venturebeat.com/2014/02/20/steve-perlman-pcell-is-real-and-it-will-change-the-world-interview/view-all/





