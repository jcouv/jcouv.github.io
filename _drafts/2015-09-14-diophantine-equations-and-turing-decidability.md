---
published: false
---


Diophantine equations and Turing decidability

Diophantine equations are polynomials with integer coefficients and solutions. 
They can be used to define Diophantine sets. To do so, you separate the variables of the polynomial into parameters and unknowns. Then the set of parameter values such that the polynomial's unknowns can be solved is called a Diophantine set.  
And any set for which you can find such a polynomial is a Diophantine set. 

For instance, the set of even numbers is Diophantine because it is represented by polynomial a - 2x = 0 (where a is a parameter and x an unknown).
The set of non-negative numbers is represented by a - (x^2 + y^2 + w^2 + z^2) = 0.

The union and intersection of Diophantine sets is also Diophantine.
FirstPolynomial^2 + SecondPolynomial^2 = 0 (with the unknowns in SecondPolynomial renamed)
FirstPolynomial * SecondPolynomial = 0

So, the set of non-negative even numbers can be represented by combining the above. More generally, there is an equivalence between determining if a Diophantine equation has integer solutions or non-negative solutions. So the default is to focus on non-negative solutions.

The notion of Diophantine sets can naturally be extended to properties, relations and functions. I'll just illustrate those with examples:
- We already saw that the set of even numbers is Diophantine, therefore so is the corresponding property: IsEven(a) -> bool.
- We could show that the set of pairs {a, b} where a is not equal to b is Diophantine, therefore so is the corresponding relation: NotEqual(a, b) -> bool.
- We could show that the set of triplets {a, b, c} where a is the remainder of b divided by c is Diophantine, therefore so is the corresponding function: a = rem(b, c).

In this fashion, step by step, you can show that more complex sets and relations are Diophantine, such as divisibility, non-divisibility, remainder, greatest common divisor, and exponentiation. The exponentiation is quite tricky and corresponds to the set of triplets {a, b, c} such that a = b^c. This allows to introduce exponential Diophantine equations (where exponentiation can appear in the expression along with additions and multiplications) and provides a method find them equivalent polynomial representations.
One further result which is quite amazing is that the IsPrime relationship is Diophantine. This means there exists a polynomial that generates all the possible primes when its parameters are allowed to take any and all natural numbers!

Cantor numbering, Gödel coding and positional coding
There are multiple ways of coding tuples into lower dimensional spaces. Cantor allows to represent a tuple of length N as an integer, but N has to be fixed.
CantorN(a1, ..., aN) is a Diophantine function, and so is the converse CantorElementNM(c)
The function CantorElement(n, m, c) which treats n and m as parameters cannot easily be shown to be Diophantine. So other representations are considered.

The Gödel coding is introduced, which allows to encode tuples {a1, ..., aN} of arbitrary dimension into a triplet (and you could even go further and encode that triplet with Cantor if you wanted). It's based on the Chinese Remainder Theorem and is defined as the triples {a, b, n} such that aI = rem(a, bi+1) = GodelElement(a, b, i). There is more than one such triple, so the coding is not unique (unlike Cantor's). Also, that coding is Diophantine as the remainder function is. There is no converse Godel(a1, ..., aN, n) function as that function would have a variable number of parameters.

The positional coding also represents a tuple as a triplet {a, b, n}, where a in the representation in base-b of the tuple. That means a = aN b^n-1 + ... + a1 b^0. Not every tuple is a positional code, but the property IsPositionalCode(a, b, n) can tell which ones are. That property is Diophantine, and so are the relations for comparing such encoded tuples, PositionalEqual(a1, b1, c1, a2, b2, c2).


It gets trippy when Universal Diophantine Equations are introduced and constructed. Those are polynomials where the variables are grouped into code parameters, element parameters and unknowns. It is universal if it can code (by choosing the code parameters) for any Diophantine equation, which means it will define the same set.

Chapter 5 provides a very nice introduction to Turing machines. This is followed by a method which given a Diophantine polynomial constructs a program to verifies whether a tuple is in that Diophantine set. It then proceeds to do the converse, by constructing from a given Turing program a Diophantine equation, such that the input tuples for which the program will terminate and the Diophantine set are identical.

Misc
Max number of variables and degrees.
