---
published: false
---

---
title: Diophantine equations and Turing decidability
layout: page
---

I enjoyed reading Yuri Matiyasevich's [Hilbert 10th Problem](http://smile.amazon.com/Hilberts-10th-Problem-Foundations-Computing/dp/0262132958/) (Thanks Stéphane for the recommendation).  
It is rather accessible overall, but some demonstrations do get quite mind-bending. Below are my notes on the key topics (mostly covered by the first 5 chapters).

![H10 cover.jpg]({{site.baseurl}}/archives/images/H10 cover.jpg)


## Diophantine equations, sets and relations
Diophantine equations are polynomials with integer coefficients and variables. 
They can be used to define Diophantine sets. To do so, you separate the variables of the polynomial into parameters and unknowns. Then the set of parameter values such that the polynomial's unknowns can be solved is called a Diophantine set.  
Any set for which you can find such a polynomial is a Diophantine set. 

For instance, the set of even numbers is Diophantine because it is represented by polynomial `a - 2x = 0` (where `a` is a parameter and `x` an unknown).
Similarly, because of Lagrange's four-square theorem, the set of non-negative numbers is represented by <code>a - (x<sup>2</sup> + y<sup>2</sup> + w<sup>2</sup> + z<sup>2</sup>) = 0</code>.

The intersection and union of Diophantine sets is also Diophantine, if you consider the following polynomials respectively:   

1. <code>FirstPolynomial<sup>2</sup> + SecondPolynomial<sup>2</sup> = 0</code> (with the unknowns in SecondPolynomial renamed to avoid conflicts)  
2. <code>FirstPolynomial * SecondPolynomial = 0</code>



By combining the above, you can make a polynomial representing the set of numbers that are both even and non-negative.  
More generally, there is an equivalence between determining if a Diophantine equation has integer solutions or non-negative solutions. So the default is to focus on non-negative solutions.

The notion of Diophantine sets can naturally be extended to properties, relations and functions. I'll just illustrate those with examples:  

- We already saw that the set of even numbers is Diophantine, therefore so is the corresponding property: `IsEven(a) -> bool`.  
- We could show that the set of pairs `{a, b}` where `a` is not equal to `b` is Diophantine, therefore so is the corresponding relation: `NotEqual(a, b) -> bool`.  
- We could show that the set of triplets `{a, b, c}` where `a` is the remainder of `b` divided by `c` is Diophantine, therefore so is the corresponding function: `a = rem(b, c)`.  

In this fashion, step by step, you can show that more complex sets and relations are Diophantine, such as divisibility, non-divisibility, remainder, greatest common divisor, and exponentiation.  

The exponentiation, which corresponds to the set of triplets `{a, b, c}` such that <code>a = b<sup>c</sup></code>, can also be shown Diophantine.  
This provides a method to reduce exponential Diophantine equations (where exponentiation can appear in the expression along with additions, substractions and multiplications) to equivalent polynomials. 
A simple example to illustrate the method: create a new variable `z` to substitute to an exponential, <code>x<sup>y</sup></code>, and use this variable definition as `SecondPolynomial` (<code>z - x<sup>y</sup> = 0</code>) for the intersection formula above.  
By the way, this method of introducing more variables can be used to refactor any Diophantine equation into an equivalent equation of degree 4 at most.

The `IsPrime(a) -> bool` property is Diophantine too, which is quite an amazing result too. This means there exists a polynomial that generates exactly the set of primes when its parameters are allowed to take any and all natural numbers! (p. 55)  


## Codings: Cantor, Gödel and positional
There are multiple ways of coding tuples into lower dimensional spaces. This is useful to iterate through all possible tuples, refactor equations to fewer parameters and unknowns, and give each polynomial a number or code.  

The Cantor numbering allows to represent a tuple of length `n` as an integer (with `n` fixed).  
For n=2, it sequences pairs following the diagonals: {0, 0}, the {1, 0}, {0, 1}, then {2, 0}, {1, 1}, {0, 2}, then {3, 0} and so on as shown in the following table.  

<table style="width:100%">
  <tr> <td> </td>  <th>0</th><th>1</th><th>2</th><th>3</th><th>...</th> </tr>
  <tr> <th>0</th>  <td>0</td><td>1</td><td>3</td><td>6</td><td>10</td> </tr>
  <tr> <th>1</th>  <td>2</td><td>4</td><td>7</td><td>11</td><td>16</td> </tr>
  <tr> <th>2</th>  <td>5</td><td>8</td><td>12</td><td>17</td><td>23</td> </tr>
  <tr> <th>...</th><td>9</td><td>13</td><td>18</td><td>24</td><td>31</td> </tr>
</table>


For higher dimensions, the same method can be applied recursively to reduce the dimension one at a time.  
<code>Cantor<sub>n</sub>(a<sub>1</sub>, ..., a<sub>n</sub>) -> c</code> is a Diophantine function, and so is the converse <code>CantorElement<sub>n,i</sub>(c)</code>.
But the function `CantorElement(n, i, c)` which treats `n` and `i` as parameters cannot easily be shown to be Diophantine. So other codings are considered.

The Gödel coding allows encoding tuples <code>{a<sub>1</sub>, ..., a<sub>n</sub>}</code> of arbitrary dimension into a triplet (and you could even go further and encode that triplet with Cantor if you wanted). It's based on the Chinese Remainder Theorem and is defined as the triples `{a, b, n}` such that <code>a<sub>i</sub> = rem(a, b.i + 1) = GodelElement(a, b, i)</code>. There is more than one such triple for a given tuple, so the coding is not unique (unlike Cantor's). 
There can be no converse function, <code>Godel(a<sub>1</sub>, ..., a<sub>n</sub>, n)</code>, as it would have a variable number of parameters.
That coding is Diophantine as the remainder function is.  

The positional coding also represents a tuple as a triplet `{a, b, n}`, but where `a` is the representation in base `b` of the tuple. That means <code>a = a<sub>n</sub>.b<sup>n-1</sup> + ... + a<sub>1</sub>.b<sup>0</sup></code>. Not every tuple is a positional code, but the property `IsPositionalCode(a, b, n)` can tell which ones are. That property is Diophantine, and so are the relations for comparing such encoded tuples, <code>PositionalEqual(a<sub>1</sub>, b<sub>1</sub>, c<sub>1</sub>, a<sub>2</sub>, b<sub>2</sub>, c<sub>2</sub>)</code>.

## Universal Diophantine equations
It gets trippy when Universal Diophantine Equations are introduced and constructed. Those are polynomials where the variables are grouped into code parameters, element parameters and unknowns. It is universal if it can code (by choosing the code parameters) for any Diophantine equation, which means it will define the same set.  
Chapter 4 demonstrates that such a universal Diophantine equations can be constructed. This relies heavily on the codings introduced above. 

## Turing machines
Chapter 5 provides a very nice introduction to Turing machines. 
The alphabet is `{ *, 0, 1, 2, 3, null }` and two states are reserved as final states for `Yes` and `No`. The tape encodes a stack of integers by using 0 to separate sequences of 1's.  
During the functioning of the machines, the 1's will typically be marked as 2's or 3's temporarily, then reverted to 1's.  

After explaining how to compose machines into sequences, conditionals and loops, a number of increasingly complex machines are introduced by composition:  
`Left`, `Right`, `Write(x)`, `Read(x)` (goes to state Yes or No depending on the value read), `Stop`, `NeverStop`, `ReadNot(x)`, `Star` (jumping to head of the tape), `Vacant` (jumping to the first empty spot down the tape), `Find(k)` (which jumpts to the k'th integer on the tape), `Increase` (adds a 1 to the last integer), `Decrease`, `Delete` (deletes the last integer), `Mark(x)` (replace 1's with x's in the current integer), `IsThere(x)` (which tries to find an x on the tape), `ThereWas(x)` (which finds an x and writes it back to 1), `Restore` (set all the 2's and 3's back to 1), `Append(k)` (increment the head of the stack by the value of the k-th integer), `Copy(k)` (adds an entry on the stack, copied from the k-th integer), `Add(k, l)` (adds an entry on the stack with the sum of the k-th and l-th integers), `Mult(k, l)`, `NotGreater(k, l)`, `Equal(k, l)`, `NotEqual(k, l)`, `Next` (updates the two entries on top of the stack according to Cantor's numbering), and `Decode` (gets the Cantor pair represented by the entry on top of the stack and adds two entries storing that pair). 

## Turing decidability and Hilbert's Tenth Problem 
All these primitive machines can be used to construct a machine that recognizes a given Diophantine set (the machine will halt if and only if initialized with tuples from the set). The machine starts with the parameters on tape and then enumerates all the possible values for the unknowns, one tuple at a time. For each, it checks whether those values solve the parameterized Diophantine equation.  

A set is called Turing semidecidable if such a Turing machine exists (that will halt when and only when the machine is initialized with an n-tuple from the set). 
As mentioned above, from every Diophantine set we can construct a Turing machine that will recognize n-tuples from that set. But the converse turns out to be possible to, and every Turing semidecidable set is Diophantine.  

A set is called Turing decidable if a Turing machine exists that will halt on state `Yes` for n-tuples in the set and halt on state `No` otherwise.
From a decidable machine, you can easily make a semidecidable one. 
Conversely, if a set and it's complement are both semidecidable, then they are decidable. You could construct a "schizophrenic" machine that runs one step of each machine, and therefore would be guaranteed to halt with a `Yes` or `No`.

In this context, Hilbert Tenth Problem asks whether the set of codes of all solvable Diophantine equations (without parameters) is Turing decidable. But Matiyasevich proves the negative: there is no way of determining if a Diophantine equation is solvable in a way that is guaranteed to halt.  
Moreover, based on Church's Thesis, this conclusion holds in general; it is not contingent on the specific Turing machine introduced above.



