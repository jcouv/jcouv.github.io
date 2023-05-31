---
published: false
---
## Using MoCA

I've been very pleasantly suprised discovering MoCA and want to share my experience and some tips to help the next person.  

The wireless signal doesn't travel well from upstairs to downstairs at my place. I considered a few options to improve the connectivity of a downstairs TV: run an ethernet wire, or set up a mesh network with wireless backhaul.  
Then I discovered a more suitable solution for my situation: run ethernet over coax. This works because I have coax outlets in both places.  

The standard is called "Multimedia over Coax Alliance" (MoCA). It is as simple as placing an ethernet-to-coax adapter on each of the coax outlets.  
Even better, it turned out that my modem/router (an ARRIS TG1682G) natively supports MoCA. So I only need to 1. use one adapter and 2. enable the functionality on the router.

## Enable MoCA on router

The LED labelled MoCA on the back of the router was turned off.  
Here's how to turn it on:  
- Grab the IP address for the gateway/router by running `ipconfig`. This can then be used in a browser (connect to `http://10.0.0.1/` in my case).    
- Log into the interface. The default user name and password are `admin` and `password` if you haven't changed it (you should).   
- Head into the `Gateway > Connect > MoCA` tab and switch it to "Enable".  

![image](https://github.com/jcouv/jcouv.github.io/assets/12466233/dc8d4227-e58b-4766-b88f-35eb2394f174)

The LED on the back of the router should now be turned on (solid white). 

![Image](https://github.com/jcouv/jcouv.github.io/assets/12466233/ee4645f6-2ad9-4be8-924a-129d371817c2)

This means that the router is not only transmitting WAN signal on the coax, but it is also using another band of the coax to transmit LAN signal.

## Plug MoCA adapter

All that's left to do is plug in a MoCA adapter in another room
