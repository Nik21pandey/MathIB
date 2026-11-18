// Cambridge IGCSE Mathematics 0580 (2025-2027 syllabus) - original GenIB content.
// Text uses $...$ for inline maths and $$...$$ for display maths (KaTeX).
const R = String.raw;

export const syllabus = {
  slug: 'igcse-0580', board: 'cambridge', code: '0580', name: 'Cambridge IGCSE Mathematics',
  short: 'IGCSE 0580', level: 'igcse-ext', status: 'live',
  blurb: 'Extended tier, 2025-2027 syllabus. Paper 2 is now a non-calculator paper worth half the grade.',
  papers: [
    { name: 'Paper 2 (Extended)', calc: false, duration: '2 hours', marks: 100 },
    { name: 'Paper 4 (Extended)', calc: true, duration: '2 hours', marks: 100 },
  ],
  sections: [
    { slug: 'non-calculator-paper-2', name: 'Non-Calculator Paper 2 Sprint Hub', hub: true,
      blurb: 'Paper 2 is 2 hours, 100 marks, no calculator. These are the skills older calculator-era papers never tested: surds, exact trig values and index work by hand.' },
    { slug: 'algebra-and-functions', name: 'Algebra and Functions', blurb: 'Quadratics, sequences, and domain and range.' },
    { slug: 'calculus', name: 'Calculus', blurb: 'Differentiation and turning points.' },
  ],
};

export const topics = [
  {
    id: 'surds', section: 'non-calculator-paper-2', slug: 'surds-and-rationalising', name: 'Surds and Rationalising',
    tag: 'New for 2025',
    summary: 'Simplify surds, calculate with them exactly and rationalise denominators - all without a calculator.',
    generators: ['surd-simplify', 'surd-rationalise'],
    notes: {
      points: [
        R`A **surd** is a root that cannot be written as a fraction, such as $\sqrt{2}$ or $\sqrt{7}$. Leaving an answer as a surd keeps it exact.`,
        R`Multiply and divide freely: $\sqrt{a}\times\sqrt{b}=\sqrt{ab}$ and $\dfrac{\sqrt{a}}{\sqrt{b}}=\sqrt{\dfrac{a}{b}}$.`,
        R`To simplify, pull out the **largest square factor**: $\sqrt{72}=\sqrt{36\times 2}=6\sqrt{2}$.`,
        R`Only like surds add: $5\sqrt{3}-3\sqrt{3}=2\sqrt{3}$, but $\sqrt{2}+\sqrt{3}$ stays as it is.`,
        R`To rationalise $\dfrac{a}{\sqrt{b}}$ multiply top and bottom by $\sqrt{b}$. For $\dfrac{1}{a+\sqrt{b}}$ multiply top and bottom by the conjugate $a-\sqrt{b}$.`,
      ],
      formulas: [
        { label: 'Product rule', tex: R`\sqrt{ab}=\sqrt{a}\,\sqrt{b}` },
        { label: 'Square of a surd', tex: R`(\sqrt{a})^2=a` },
        { label: 'Conjugate product', tex: R`(a+\sqrt{b})(a-\sqrt{b})=a^2-b` },
      ],
      gdc: [],
      traps: [
        R`$\sqrt{a+b}$ is **not** $\sqrt{a}+\sqrt{b}$. Check with $\sqrt{9+16}=5$, not $7$.`,
        R`Stopping early: $\sqrt{72}=2\sqrt{18}$ is true but not fully simplified. Keep going to $6\sqrt{2}$.`,
        R`When rationalising, multiply the numerator as well as the denominator.`,
      ],
    },
  },
  {
    id: 'exact-trig', section: 'non-calculator-paper-2', slug: 'exact-trigonometric-values', name: 'Exact Trigonometric Values',
    tag: 'New for 2025',
    summary: 'Know sine, cosine and tangent of 0, 30, 45, 60 and 90 degrees exactly, and use them in triangles.',
    generators: ['exact-trig'],
    notes: {
      points: [
        R`You must **recall** the exact values for $0^\circ, 30^\circ, 45^\circ, 60^\circ$ and $90^\circ$.`,
        R`For $30^\circ$ and $60^\circ$: cut an equilateral triangle of side 2 in half. The sides are $1$, $\sqrt{3}$ and $2$.`,
        R`For $45^\circ$: use a right-angled isosceles triangle with sides $1$, $1$ and $\sqrt{2}$.`,
        R`Sine climbs $0,\ \tfrac12,\ \tfrac{\sqrt2}{2},\ \tfrac{\sqrt3}{2},\ 1$ as the angle goes $0^\circ\to 90^\circ$; cosine is the same list backwards.`,
        R`$\tan 90^\circ$ is undefined.`,
      ],
      formulas: [
        { label: '30 degrees', tex: R`\sin 30^\circ=\tfrac12,\quad \cos 30^\circ=\tfrac{\sqrt3}{2},\quad \tan 30^\circ=\tfrac{1}{\sqrt3}=\tfrac{\sqrt3}{3}` },
        { label: '45 degrees', tex: R`\sin 45^\circ=\cos 45^\circ=\tfrac{\sqrt2}{2},\quad \tan 45^\circ=1` },
        { label: '60 degrees', tex: R`\sin 60^\circ=\tfrac{\sqrt3}{2},\quad \cos 60^\circ=\tfrac12,\quad \tan 60^\circ=\sqrt3` },
      ],
      gdc: [],
      traps: [
        R`Swapping $\sin 30^\circ$ and $\sin 60^\circ$. Remember: small angle, small sine.`,
        R`Giving a decimal such as $0.866$ when the question says **exact**.`,
        R`Leaving $\tfrac{1}{\sqrt3}$ when a rationalised denominator is asked for.`,
      ],
    },
  },
  {
    id: 'indices', section: 'non-calculator-paper-2', slug: 'indices-and-standard-form-by-hand', name: 'Indices and Standard Form by Hand',
    summary: 'Negative and fractional indices, index laws and standard-form arithmetic with no calculator.',
    generators: ['indices-evaluate'],
    notes: {
      points: [
        R`Index laws: $a^m\times a^n=a^{m+n}$, $a^m\div a^n=a^{m-n}$, $(a^m)^n=a^{mn}$.`,
        R`A negative index means reciprocal: $a^{-n}=\dfrac{1}{a^n}$.`,
        R`A fractional index means a root: $a^{\frac{m}{n}}=\left(\sqrt[n]{a}\right)^m$. Take the **root first** to keep the numbers small.`,
        R`In standard form $A\times10^n$, $1\le A<10$. Multiply the numbers and add the powers, then re-adjust $A$.`,
      ],
      formulas: [
        { label: 'Zero index', tex: R`a^0=1` },
        { label: 'Fractional index', tex: R`a^{\frac{m}{n}}=\left(\sqrt[n]{a}\right)^m` },
      ],
      gdc: [],
      traps: [
        R`$5^{-2}$ is $\tfrac{1}{25}$, not $-25$ and not $-10$.`,
        R`$(2x^3)^4=16x^{12}$: the power applies to the 2 as well.`,
        R`$0.6\times10^8$ is not standard form. Rewrite it as $6\times10^7$.`,
      ],
    },
  },
  {
    id: 'domain-range', section: 'algebra-and-functions', slug: 'functions-domain-and-range', name: 'Functions: Domain and Range',
    tag: 'New for 2025',
    summary: 'Identify the inputs a function accepts and the outputs it can produce.',
    generators: ['linear-eq'],
    notes: {
      points: [
        R`The **domain** is the set of allowed inputs $x$. The **range** is the set of outputs $f(x)$ those inputs produce.`,
        R`A linear function on $a\le x\le b$: evaluate at both ends to get the range.`,
        R`A quadratic: find the turning point first. It may give the smallest or largest output.`,
        R`Exclude any input that would mean dividing by zero.`,
        R`For an inverse function, the domain and range swap over.`,
      ],
      formulas: [
        { label: 'Composite', tex: R`fg(x)=f\big(g(x)\big)` },
      ],
      gdc: [],
      traps: [
        R`For a quadratic on a restricted domain, the end points are not always the extremes. Check the vertex.`,
        R`Writing the range in terms of $x$. The range is about $f(x)$, e.g. $f(x)\ge 1$.`,
        R`$fg(x)$ means do $g$ **first**, then $f$.`,
      ],
    },
  },
  {
    id: 'quadratics', section: 'algebra-and-functions', slug: 'quadratic-equations', name: 'Quadratic Equations',
    summary: 'Factorise, complete the square and use the formula, giving exact answers where required.',
    generators: ['expand-double', 'factorise-quadratic'],
    notes: {
      points: [
        R`To factorise $x^2+bx+c$ find two numbers that multiply to $c$ and add to $b$.`,
        R`Always rearrange to $\ldots=0$ before solving.`,
        R`Completing the square: $x^2+bx+c=\left(x+\tfrac{b}{2}\right)^2-\left(\tfrac{b}{2}\right)^2+c$. The turning point is then visible.`,
        R`On the non-calculator paper leave formula answers as simplified surds.`,
      ],
      formulas: [
        { label: 'Quadratic formula', tex: R`x=\dfrac{-b\pm\sqrt{b^2-4ac}}{2a}` },
        { label: 'Difference of two squares', tex: R`a^2-b^2=(a-b)(a+b)` },
      ],
      gdc: [],
      traps: [
        R`Sign slips: $(x-7)(x+2)=0$ gives $x=7$ and $x=-2$.`,
        R`In the formula, the whole numerator is divided by $2a$, not just the square root.`,
        R`Rejecting a negative solution only when the context (a length, a count) demands it - and saying so.`,
      ],
    },
  },
  {
    id: 'sequences', section: 'algebra-and-functions', slug: 'sequences-and-nth-term', name: 'Sequences and the nth Term',
    summary: 'Find and use nth-term rules for linear, quadratic and exponential sequences.',
    generators: ['nth-term-linear', 'nth-term-quadratic'],
    notes: {
      points: [
        R`Linear: a constant first difference $d$ gives $dn+c$.`,
        R`Quadratic: a constant **second** difference $s$ gives $\tfrac{s}{2}n^2$ plus a linear part. Subtract $\tfrac{s}{2}n^2$ from each term to find it.`,
        R`Exponential (geometric): each term is multiplied by a constant ratio $r$, giving $ar^{\,n-1}$.`,
        R`To test whether a number is in a sequence, set the nth term equal to it and check that $n$ is a positive whole number.`,
      ],
      formulas: [
        { label: 'Linear', tex: R`u_n=dn+(a-d)` },
        { label: 'Geometric', tex: R`u_n=ar^{\,n-1}` },
      ],
      gdc: [],
      traps: [
        R`Using the first term as the constant: for $7, 11, 15,\ldots$ the rule is $4n+3$, not $4n+7$.`,
        R`Halving forgotten: a second difference of 4 means $2n^2$, not $4n^2$.`,
      ],
    },
  },
  {
    id: 'differentiation', section: 'calculus', slug: 'differentiation-and-turning-points', name: 'Differentiation and Turning Points',
    summary: 'Differentiate powers of x, find gradients and locate and classify turning points.',
    generators: ['differentiate-poly'],
    notes: {
      points: [
        R`Multiply by the power, then reduce the power by one.`,
        R`The derivative gives the gradient of the curve at any point.`,
        R`At a turning point the gradient is zero: solve $\dfrac{dy}{dx}=0$.`,
        R`Classify with the second derivative: positive means minimum, negative means maximum.`,
      ],
      formulas: [
        { label: 'Power rule', tex: R`y=ax^n\ \Rightarrow\ \dfrac{dy}{dx}=anx^{n-1}` },
      ],
      gdc: [],
      traps: [
        R`A constant differentiates to $0$, not to itself.`,
        R`Finding the $x$-values and forgetting the $y$-coordinates when the question asks for **points**.`,
      ],
    },
  },
];

// q: [id, topic, difficulty, marks, calc, stem, parts, scheme, answer]
export const questions = [
  ['su1', 'surds', 'easy', 2, false, R`Simplify $\sqrt{48}$.`, null,
    [['M1', R`$\sqrt{16\times 3}$ or $\sqrt{16}\times\sqrt{3}$`], ['A1', R`$4\sqrt{3}$`]], R`$4\sqrt{3}$`],
  ['su2', 'surds', 'easy', 2, false, R`Simplify $\sqrt{75}-\sqrt{27}$.`, null,
    [['M1', R`$5\sqrt{3}$ or $3\sqrt{3}$ seen`], ['A1', R`$2\sqrt{3}$`]], R`$2\sqrt{3}$`],
  ['su3', 'surds', 'medium', 3, false, R`Rationalise the denominator of $\dfrac{12}{\sqrt{6}}$. Give your answer in its simplest form.`, null,
    [['M1', R`Multiplies by $\dfrac{\sqrt{6}}{\sqrt{6}}$`], ['A1', R`$\dfrac{12\sqrt{6}}{6}$`], ['A1', R`$2\sqrt{6}$`]], R`$2\sqrt{6}$`],
  ['su4', 'surds', 'medium', 3, false, R`Expand and simplify $(3+\sqrt{5})(2-\sqrt{5})$.`, null,
    [['M1', R`$6-3\sqrt{5}+2\sqrt{5}-(\sqrt{5})^2$, at least three terms correct`], ['M1', R`Uses $(\sqrt{5})^2=5$`], ['A1', R`$1-\sqrt{5}$`]], R`$1-\sqrt{5}$`],
  ['su5', 'surds', 'hard', 4, false, R`Rationalise the denominator of $\dfrac{6}{3-\sqrt{3}}$. Give your answer in the form $a+b\sqrt{3}$.`, null,
    [['M1', R`Multiplies numerator and denominator by $3+\sqrt{3}$`], ['M1', R`Denominator $9-3=6$`], ['M1', R`Numerator $18+6\sqrt{3}$`], ['A1', R`$3+\sqrt{3}$`]], R`$3+\sqrt{3}$`],
  ['su6', 'surds', 'exam', 5, false, R`A rectangle has area $(17+8\sqrt{2})\ \text{cm}^2$ and length $(5+\sqrt{2})\ \text{cm}$.`,
    [['a', R`Find the width of the rectangle in the form $a+b\sqrt{2}$.`, 4], ['b', R`Find the perimeter of the rectangle.`, 1]],
    [['M1', R`(a) $\dfrac{17+8\sqrt{2}}{5+\sqrt{2}}\times\dfrac{5-\sqrt{2}}{5-\sqrt{2}}$`], ['M1', R`Numerator $85-17\sqrt{2}+40\sqrt{2}-16=69+23\sqrt{2}$`], ['M1', R`Denominator $25-2=23$`], ['A1', R`$3+\sqrt{2}$`], ['B1', R`(b) $2(5+\sqrt{2}+3+\sqrt{2})=16+4\sqrt{2}$ cm`]],
    R`(a) $3+\sqrt{2}$ cm  (b) $16+4\sqrt{2}$ cm`],

  ['et1', 'exact-trig', 'easy', 1, false, R`Write down the exact value of $\cos 60^\circ$.`, null,
    [['B1', R`$\dfrac12$`]], R`$\dfrac12$`],
  ['et2', 'exact-trig', 'easy', 2, false, R`Work out the exact value of $2\sin 30^\circ+\tan 45^\circ$.`, null,
    [['M1', R`$\sin 30^\circ=\tfrac12$ or $\tan 45^\circ=1$`], ['A1', R`$2$`]], R`$2$`],
  ['et3', 'exact-trig', 'medium', 3, false, R`Find the exact value of $\sin 60^\circ\times\tan 30^\circ$.`, null,
    [['M1', R`$\sin 60^\circ=\dfrac{\sqrt3}{2}$`], ['M1', R`$\tan 30^\circ=\dfrac{1}{\sqrt3}$`], ['A1', R`$\dfrac12$`]], R`$\dfrac12$`],
  ['et4', 'exact-trig', 'medium', 3, false, R`Triangle $ABC$ has a right angle at $B$. Angle $BAC=30^\circ$ and $AC=12$ cm. Find the exact lengths of $BC$ and $AB$.`, null,
    [['M1', R`$BC=12\sin 30^\circ$ or $AB=12\cos 30^\circ$`], ['A1', R`$BC=6$ cm`], ['A1', R`$AB=6\sqrt{3}$ cm`]], R`$BC=6$ cm, $AB=6\sqrt{3}$ cm`],
  ['et5', 'exact-trig', 'medium', 3, false, R`In triangle $PQR$, $PQ=8$ cm, $QR=3\sqrt{3}$ cm and angle $PQR=60^\circ$. Show that the area of the triangle is $18\ \text{cm}^2$.`, null,
    [['M1', R`$\tfrac12\times 8\times 3\sqrt{3}\times\sin 60^\circ$`], ['M1', R`Uses $\sin 60^\circ=\dfrac{\sqrt3}{2}$`], ['A1', R`$12\sqrt{3}\times\dfrac{\sqrt3}{2}=\dfrac{36}{2}=18$, fully shown`]], R`Shown: $18\ \text{cm}^2$`],
  ['et6', 'exact-trig', 'hard', 4, false, R`Without using a calculator, show that $$\frac{\tan 60^\circ-\tan 30^\circ}{1+\tan 60^\circ\tan 30^\circ}=\frac{\sqrt3}{3}.$$`, null,
    [['M1', R`$\tan 60^\circ=\sqrt3$ and $\tan 30^\circ=\dfrac{1}{\sqrt3}$`], ['M1', R`Numerator $\sqrt3-\dfrac{1}{\sqrt3}=\dfrac{2}{\sqrt3}$`], ['M1', R`Denominator $1+1=2$`], ['A1', R`$\dfrac{1}{\sqrt3}=\dfrac{\sqrt3}{3}$`]], R`Shown`],

  ['in1', 'indices', 'easy', 1, false, R`Write down the value of $5^{-2}$.`, null, [['B1', R`$\dfrac{1}{25}$`]], R`$\dfrac{1}{25}$`],
  ['in2', 'indices', 'easy', 2, false, R`Work out $27^{\frac23}$.`, null, [['M1', R`$\sqrt[3]{27}=3$`], ['A1', R`$9$`]], R`$9$`],
  ['in3', 'indices', 'medium', 2, false, R`Simplify $(2x^3)^4$.`, null, [['B1', R`$16$`], ['B1', R`$x^{12}$`]], R`$16x^{12}$`],
  ['in4', 'indices', 'medium', 3, false, R`Work out $\left(\dfrac{16}{81}\right)^{-\frac34}$.`, null,
    [['M1', R`Reciprocal: $\left(\dfrac{81}{16}\right)^{\frac34}$`], ['M1', R`Fourth root: $\dfrac32$`], ['A1', R`$\dfrac{27}{8}$`]], R`$\dfrac{27}{8}$`],
  ['in5', 'indices', 'hard', 3, false, R`Solve $9^{x}=27^{x-1}$.`, null,
    [['M1', R`Writes both sides as powers of 3: $3^{2x}=3^{3(x-1)}$`], ['M1', R`$2x=3x-3$`], ['A1', R`$x=3$`]], R`$x=3$`],
  ['in6', 'indices', 'exam', 4, false, R`Give each answer in standard form.`,
    [['a', R`Work out $(4.2\times10^{5})\div(7\times10^{-3})$.`, 2], ['b', R`Work out $(3\times10^{4})^2+5\times10^{8}$.`, 2]],
    [['M1', R`(a) $0.6\times10^{8}$`], ['A1', R`$6\times10^{7}$`], ['M1', R`(b) $9\times10^{8}+5\times10^{8}=14\times10^{8}$`], ['A1', R`$1.4\times10^{9}$`]],
    R`(a) $6\times10^{7}$  (b) $1.4\times10^{9}$`],

  ['dr1', 'domain-range', 'easy', 2, true, R`$f(x)=3x-2$ has domain $\{-1,\,0,\,2\}$. Find the range of $f$.`, null,
    [['M1', R`Substitutes at least two of the values`], ['A1', R`$\{-5,\,-2,\,4\}$`]], R`$\{-5,\,-2,\,4\}$`],
  ['dr2', 'domain-range', 'medium', 2, true, R`$f(x)=x^2+1$ for all real values of $x$. Write down the range of $f$.`, null,
    [['B2', R`$f(x)\ge 1$ (B1 for identifying 1 as the least value)`]], R`$f(x)\ge 1$`],
  ['dr3', 'domain-range', 'medium', 3, true, R`$f(x)=2x+5$ for $-1\le x\le 4$.`,
    [['a', R`Find the range of $f$.`, 2], ['b', R`Write down the domain of $f^{-1}$.`, 1]],
    [['M1', R`(a) $f(-1)=3$ and $f(4)=13$`], ['A1', R`$3\le f(x)\le 13$`], ['B1', R`(b) $3\le x\le 13$`]], R`(a) $3\le f(x)\le 13$  (b) $3\le x\le 13$`],
  ['dr4', 'domain-range', 'hard', 4, true, R`$g(x)=(x-3)^2-4$ for $0\le x\le 5$. Find the range of $g$.`, null,
    [['M1', R`Least value $-4$ at $x=3$`], ['M1', R`$g(0)=5$ and $g(5)=0$`], ['A1', R`Greatest value $5$`], ['A1', R`$-4\le g(x)\le 5$`]], R`$-4\le g(x)\le 5$`],
  ['dr5', 'domain-range', 'exam', 6, true, R`$f(x)=\dfrac{1}{x-2},\ x\ne 2$ and $g(x)=x^2+1$.`,
    [['a', R`Explain why $x=2$ is excluded from the domain of $f$.`, 1], ['b', R`Find $gf(3)$.`, 2], ['c', R`Solve $fg(x)=\dfrac13$.`, 3]],
    [['B1', R`(a) It would mean dividing by zero`], ['M1', R`(b) $f(3)=1$`], ['A1', R`$g(1)=2$`], ['M1', R`(c) $fg(x)=\dfrac{1}{x^2-1}$`], ['M1', R`$x^2-1=3$`], ['A1', R`$x=\pm 2$`]],
    R`(b) $2$  (c) $x=\pm2$`],

  ['qd1', 'quadratics', 'easy', 2, false, R`Factorise $x^2+7x+12$.`, null, [['B2', R`$(x+3)(x+4)$ (B1 for brackets that give two correct terms)`]], R`$(x+3)(x+4)$`],
  ['qd2', 'quadratics', 'easy', 3, false, R`Solve $x^2-5x-14=0$.`, null,
    [['M2', R`$(x-7)(x+2)$ (M1 for brackets giving two correct terms)`], ['A1', R`$x=7$ or $x=-2$`]], R`$x=7$ or $x=-2$`],
  ['qd3', 'quadratics', 'medium', 3, false, R`Solve $2x^2+x-6=0$.`, null,
    [['M2', R`$(2x-3)(x+2)$`], ['A1', R`$x=\dfrac32$ or $x=-2$`]], R`$x=\dfrac32$ or $x=-2$`],
  ['qd4', 'quadratics', 'medium', 3, false, R`Write $x^2-6x+11$ in the form $(x-a)^2+b$ and hence write down the coordinates of the minimum point of $y=x^2-6x+11$.`, null,
    [['M1', R`$(x-3)^2$`], ['A1', R`$(x-3)^2+2$`], ['B1', R`$(3,\,2)$`]], R`$(x-3)^2+2$; minimum at $(3,\,2)$`],
  ['qd5', 'quadratics', 'hard', 4, false, R`Solve $3x^2-8x+2=0$. Give your answers in the form $\dfrac{p\pm\sqrt{q}}{r}$ in their simplest form.`, null,
    [['M1', R`$x=\dfrac{8\pm\sqrt{(-8)^2-4(3)(2)}}{2(3)}$`], ['A1', R`Discriminant $40$`], ['M1', R`$\sqrt{40}=2\sqrt{10}$`], ['A1', R`$x=\dfrac{4\pm\sqrt{10}}{3}$`]], R`$x=\dfrac{4\pm\sqrt{10}}{3}$`],
  ['qd6', 'quadratics', 'exam', 6, false, R`A rectangular garden has length $(x+5)$ m and width $(x-2)$ m. Its area is $44\ \text{m}^2$.`,
    [['a', R`Show that $x^2+3x-54=0$.`, 2], ['b', R`Solve $x^2+3x-54=0$.`, 3], ['c', R`Find the perimeter of the garden.`, 1]],
    [['M1', R`(a) $(x+5)(x-2)=44$`], ['A1', R`$x^2+3x-10=44$ leading to the given equation`], ['M2', R`(b) $(x+9)(x-6)$`], ['A1', R`$x=6$ or $x=-9$`], ['B1', R`(c) $x=6$, sides 11 m and 4 m, perimeter $30$ m`]],
    R`(b) $x=6$ or $x=-9$  (c) $30$ m`],

  ['sq1', 'sequences', 'easy', 2, false, R`Find the nth term of the sequence $7,\ 11,\ 15,\ 19,\ \ldots$`, null,
    [['M1', R`$4n$`], ['A1', R`$4n+3$`]], R`$4n+3$`],
  ['sq2', 'sequences', 'medium', 3, false, R`Find the nth term of the sequence $3,\ 9,\ 19,\ 33,\ 51,\ \ldots$`, null,
    [['M1', R`Second difference $4$`], ['M1', R`$2n^2$`], ['A1', R`$2n^2+1$`]], R`$2n^2+1$`],
  ['sq3', 'sequences', 'medium', 3, false, R`The nth term of a sequence is $2\times3^{\,n-1}$.`,
    [['a', R`Find the 5th term.`, 1], ['b', R`Which term of the sequence is $1458$?`, 2]],
    [['B1', R`(a) $162$`], ['M1', R`(b) $3^{\,n-1}=729=3^6$`], ['A1', R`$n=7$`]], R`(a) $162$  (b) the 7th term`],
  ['sq4', 'sequences', 'hard', 4, false, R`The nth term of a sequence is $n^2+3n$. Show that $108$ is a term of this sequence and state which term it is.`, null,
    [['M1', R`$n^2+3n-108=0$`], ['M1', R`$(n+12)(n-9)$`], ['A1', R`$n=9$`], ['A1', R`Rejects $n=-12$; $108$ is the 9th term`]], R`The 9th term`],

  ['df1', 'differentiation', 'easy', 2, true, R`$y=x^3-4x^2+7$. Find $\dfrac{dy}{dx}$.`, null,
    [['B2', R`$3x^2-8x$ (B1 for one correct term)`]], R`$3x^2-8x$`],
  ['df2', 'differentiation', 'medium', 3, true, R`Find the gradient of the curve $y=2x^3-5x$ at the point where $x=2$.`, null,
    [['M1', R`$\dfrac{dy}{dx}=6x^2-5$`], ['M1', R`Substitutes $x=2$`], ['A1', R`$19$`]], R`$19$`],
  ['df3', 'differentiation', 'hard', 6, true, R`A curve has equation $y=x^3-3x^2-9x+2$. Find the coordinates of the two turning points and determine whether each is a maximum or a minimum.`, null,
    [['M1', R`$\dfrac{dy}{dx}=3x^2-6x-9$`], ['M1', R`Sets equal to $0$: $3(x-3)(x+1)=0$`], ['A1', R`$x=3$ and $x=-1$`], ['A1', R`$(-1,\,7)$`], ['A1', R`$(3,\,-25)$`], ['B1', R`$\dfrac{d^2y}{dx^2}=6x-6$: negative at $x=-1$ so maximum, positive at $x=3$ so minimum`]],
    R`Maximum at $(-1,\,7)$, minimum at $(3,\,-25)$`],
];
