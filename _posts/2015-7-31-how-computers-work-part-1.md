---
layout: post
title: How computers work (part 1)
---
A while back, one of my nephews asked me how computers work. During our recent sailing trip, I spent some time with him to answer that question. I will share the introduction I gave him over the next few  posts.  
Feel free to drop a comment if something needs elaborating. A later post will list technical references for further reading.

"How do computers work?" can be answered at many levels, just like "How does biological life work?". For life, you can explain that there is an ecosystem of plants and animals, the interaction of animals, the physical and behavioral attributes of individuals of a specie, the function of different organs in their body, the cellular structure of each organ, or the atomic structure of different types of cells.

For computers, there is a similar hierarchy of abstractions: ecosystem of computers (networks), individual computers formed of large components (screen, keyboard, proceesor, memory) and software, circuits forming processors and memory, and the atomic-size elements (transistors, wires) forming those circuits. At a high level, you plug the power, keyboard and screen. At a low level, electrons flow through circuits and light up the display. 

I will mainly focus on the hardware part, starting from the bottom (transistor, see next post). We'll build up to a processor by assembling simple and small components into more advanced and larger components. I won't discuss the software part much (maybe later).  
It is useful if you have been exposed to basics of software programming (mathematical primitives, conditionals, loops, variables, functions/modules), as the computer we will "build" will implement those instructions. 
I will also assume that you are familiar with logic (booleans, AND/OR/NOT operations) and binary representation of numbers (base-2/binary 110 is base-10/decimal 6; in binary 110 + 1010 = 10000 just like 6 + 10 = 16 in decimal).

Before laying the first brick, let me give an overview of what we are going to build. The processor is the central component of a computer. At every tick of the clock, it reads an instruction and executes it. In a sense, the processor is like a dull but diligent factory worker who follows a detailed recipe or script (1- "take a screw from shelf A", 2- "take a part from shelf B", 3- "attach the screw to the part", 4- "put the result in a bin", 5- "if no screws are left, call the supervisor", and 6- "start over at step 1").  
The processor can execute different types of instructions, such as "read input number from memory A", "add two numbers", and "write output number into memory B". The processor normally follows the instructions in order, but it can be instructed to jump to a different instruction ("jump to step X", or "if number is zero, then jump to step  Y, otherwise proceed to next instruction").  
Recipes are called algorithms. You can solve complex problems with a long list of such simple instructions, just like you can manufacture a car with a worker following a long list of small steps.

Next time, we'll start our pyramid by looking at transistors. We'll then assemble transistors to make simple logical components (AND, OR, NOT), followed by  slightly more advanced arithmetic components (ADD). After that we'll look at stateful components (used to store information) and build a simple processor and finally computer.
