---
published: false
---

Diophantine equations and Turing decidability

Diophantine equations are polynomials with integer constants and solutions.
They can be used to define Diophantine sets (and relations). To do so, you separate the variables of the polynomial into parameters and unknowns. Then the set of parameter values such that the polynomial's unknowns can be solved is called a Diophantine set.  
And any set for which you can find such a polynomial is a Diophantine set. 

For instance, the set of even numbers is Diophantine because it is represented by polynomial a - 2x = 0 (where a is a parameter and x an unknown).

The union and intersection of Diophantine sets is also Diophantine.
FirstPolynomial^2 + SecondPolynomial^2 = 0
FirstPolynomial * SecondPolynomial = 0

Step by step, you can show that more complex sets are Diophantine, such as the set of exponentials (for any a and n, {a, a^n}) or the set of prime numbers.

It gets trippy when Universal Diophantine Equations are introduced and constructed. Those are polynomials where the variables are grouped into code parameters, element parameters and unknowns. It is universal if it can code (by choosing the code parameters) for any Diophantine equation, which means it will define the same set.

Chapter 5 provides a very nice introduction to Turing machines. This is followed by a method which given a Diophantine polynomial constructs a program to verifies whether a tuple is in that Diophantine set. It then proceeds to do the converse, by constructing from a given Turing program a Diophantine equation, such that the input tuples for which the program will terminate and the Diophantine set are identical.  


