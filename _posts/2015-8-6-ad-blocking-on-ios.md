---
title: Ad blocking on iOS
---

Mobile browsers don't support extensions like their desktop counterparts and most don't have an ad blocker built-in. But it turns out that iOS (and probably Android and Windows Phone) supports good old "proxy auto-configuration" (PAC).  
PAC is a mechanism by which the operating system uses a simple script file to choose when to use a proxy. The script receives the host and url of each web request and tells the operating system whether to connect directly (as normal) or instead use a proxy.   
The trick is to use a blackhole proxy (which returns no content) for urls that are recognized as advertisement, based on a list of known domains and url patterns.  
 
So I dug up an existing ad-blocking PAC file which seems somehow up-to-date (no-ads version 5.125 from [John LoVerso](http://www.schooner.com/~loverso/no-ads/)), configured the blackhole proxy to Google's DNS server (8.8.8.8 port 53), and updated my iOS wi-fi settings to point to it. I tested in Chrome on iPhone and iPad and this method seems to work. 

You can try this solution by following the instructions below, but please read the security considerations below first.  
You should note that PAC only works for wi-fi in iOS, not on cellular or other connections.  
Also, you should know that iOS 9 may have official support for ad blocking extensions. The details are not yet known.  

# How to install

On iOS, go to Settings > Wi-Fi and open the configuration for the wi-fi you're connected to. At the bottom, switch the HTTP proxy option to "Auto" and copy and paste [http://blog.monstuff.com/ad-block-pac.js](http://blog.monstuff.com/ad-block-pac.js) into the box. 
 
![PAC configuration in iOS](http://i59.tinypic.com/dlnskh.png)


# Security considerations

Configuring a PAC file into your operating system can be dangerous. If the PAC file is adversarial or was modified by a hacker, the attacker could send parts or all of your web traffic through a proxy of his choice.  

What is typically recommended is for you to use your own copy of this file (you still have to host your copy securely).  

The way I'm looking to solve this is to host the PAC file on a trusted CDN of immutable files. But I have not yet found an appropriate CDN.    
This will allow you to review the contents of the PAC file you choose (it's easy to check the code to see it only points to Google's DNS servers as blackhole proxies) and have peace of mind that it cannot be surreptitiously updated.  
On the other hand, this means you'll have to update your OS settings if you want to use a newer version of the file.    

Another approach I'm going to investigate to solve this security problem is trying to host the PAC file on the device itself. This would mean installing an iOS app containing a PAC file and referencing that file from the network settings of the OS. I'll post an update once I try.  

Any other ideas are appreciated.  

# Using Google DNS as blackhole

The idea of using Google DNS servers comes from the [FAQ of Weblock](https://www.weblockapp.com/faq/#question-7), an iOS app which generates PAC files. The FAQ offers a good explanation for this choice:

> 1. iOS requires dummy proxy to be a valid IP address accepting connections (so it's not possible to use local IP address of your device, since there is no open port to connect to). 
> 2. It's really responsive, fast and stable anywhere in the world. 
> 3. It's NOT ABLE to handle HTTP/HTTPS traffic, since it's a DNS server (it handles an entirely different protocol). It immediately closes the HTTP/HTTPS connection (which is perfect!). 
> 4. It's widely recognized and well known IP, so you don't have to be concerned about your privacy. We're quite sure Google is not logging all web connection attempts made while blocking content from your device, since this dummy proxy is actually a DNS server supporting a different kind of requests. 

Weblock also hosts some PAC files. Here's a few I've seen referenced: [http://wl.is/zXsGpP.js](http://wl.is/zXsGpP.js), [http://wl.is/EA9Ina.js](http://wl.is/EA9Ina.js) and [http://wl.is/KT9Ugo.js](http://wl.is/KT9Ugo.js).
