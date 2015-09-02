---
layout: post
title: pCell technology
published: false
---


# Personal cell

I've been keeping an eye on the pCell technology for a while. It's pretty exciting.
The problem is that normal wireless networks share bandwidth within a cell (area covered by one antenna). So the more devices you add and the less bandwidth they each receive. The standard solution is to add more antennas and have each antenna be less powerful (cover a smaller area). But this is tricky, as different cells interfere with each other where the areas overlap and you get very uneven coverage and data rates. 

Here's my understanding of the pCell solution:
A server controls a number of antennas and keeps track of the distance (latency) between each device and each antenna. When it wants to send a message a specific device, it adds that message to the signal of each antenna with compensating delay. The result is that that message will constructively interfere at the location of the target device. This "personal cell" (pCell) is apparently smaller than a cubic inch, allowing for proximity between devices.  
For outgoing messages from the device, the server applies compensating delay to the signals received by each antenna and adds them up. This reconstructs the message sent by that particular device. The same process is applied for each tracked device.  
When devices move, their distance (latency) to each antenna changes and the server needs to keep track of that. I don't have a good understand of how they solved that, but apparently their approach relies on the Doppler effect.  

Some people were not sure whether such a design would be compatible with Shannon's channel limit. I'm not sure how that concern was resolved, but the demos and the recently released product seem to suggest pCell does work.  




http://www.rearden.com/artemis/An-Introduction-to-pCell-White-Paper-150224.pdf
