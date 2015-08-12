---
layout: post
title: How computers work (part 2)
published: false
---



The building block of a modern computer is the transistor. But it takes many. Your phone has a few billions of them (I'll discuss fabrication later).    
The solution to this complexity is abstraction. We'll take a couple of transistors to make a simple component. Those components will be combined to achieve more complex components and so on. It is like Russian dolls.  
For today, we'll consider a single transistor and then put two together to achieve something useful. 

![venice.jpg]({{site.baseurl}}/assets/venice.jpg)


TODO: Two views of a transistor. 

As the diagram shows, a transistor has three ends. The control (on the left) determines whether the other two (on the right) are connected. If the control is activated by a voltage, then the transistor behaves like a wire. If the control is inactive, then the circuit is broken (electricity cannot pass between those two ends, like a turned off switch).  

The first component we will build is a NOT. It has one input and one output. If the input is activated, then the output is off (no tension). But if the input is left inactive, then the output is on. We're only interested in the input being on or off (no intermediary voltages).    
The NOT can be represented by the following component diagram and truth table (listing input and corresponding output values). 

TODO: component diagram and truth table for NOT 

The next question is how to implement the NOT. As the diagram below shows, all it takes is a transistor and a resistor. 

TODO: diagrams for NOT with a transistor

When the control is off, the transistor behaves like a disconnected wire. So the output is connected through a resistor to V, which means the output will have tension (it is on).  
But when the control is on, the transistor behaves like a wire. The output is still connected through a resistor to V but it is also directly connected to 0. The result is no tension on the output (it is off).
