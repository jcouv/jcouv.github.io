---
published: false
title: Enumerating Diophantine equations
---

I mentioned this problem in passing in my last post, but it's really not trivial. Here's the method exposed in Matiyasevich's Hilbert's Tenth Problem. The method originates from [Julia Robinson](https://en.wikipedia.org/wiki/Julia_Robinson), in Diophantine Decision Problems (in [Studies in Number Theory](http://smile.amazon.com/Studies-Number-Theory-William-Leveque/dp/0883851067/)).

Here are the rules she offers to generate all integer polynomials P<sub>m</sub> and all positive integer polynomials T<sub>n</sub>:  

- T<sub>4n</sub> = n
- T<sub>4n+1</sub> = x<sub>n</sub>
- T<sub>4n+2</sub> = T<sub>CantorLeft(n)</sub> + T<sub>CantorRight(n)</sub>
- T<sub>4n+3</sub> = T<sub>CantorLeft(n)</sub> * T<sub>CantorRight(n)</sub>
- P<sub>m</sub> = T<sub>CantorLeft(m)</sub> - T<sub>CantorRight(m)</sub>

As you can see, T<sub>n</sub> will includes all possible constants and unknowns, as well as any sums or products of other T<sub>n</sub> elements. Then P<sub>m</sub> will be the difference of any two T<sub>n</sub> elements.

An example: P<sub>7,297,614,550</sub> = 2.x<sub>0</sub><sup>2</sup> - (1 + x<sub>1</sub><sup>2</sup>)

One thing to notice is that T<sub>n</sub> will generate duplicates. For instance, T<sub>4n+2</sub> = T<sub>4m+2</sub> when CantorLeft(n) = CantorRight(m) and CantorRight(n) = CantorLeft(m). I don't know if there is a numbering that avoids such duplication.

![Julia Robinson.jpg]({{site.baseurl}}/archives/images/Julia Robinson.jpg)

