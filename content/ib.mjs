// IB Diploma Mathematics - original MathIB content.
const R = String.raw;

export const syllabuses = [
  {
    slug: 'ibdp-math-aa-hl', board: 'ib', code: 'AA HL', name: 'IB DP Mathematics: Analysis and Approaches HL',
    short: 'IBDP AA HL', level: 'ib-aa-hl', status: 'live',
    blurb: 'Switch between the current guide (exams to November 2028) and the new course (first teaching August 2027, first exams May 2029).',
    papers: [
      { name: 'Paper 1', calc: false, duration: '2 hours', marks: 110 },
      { name: 'Paper 2', calc: true, duration: '2 hours', marks: 110 },
      { name: 'Paper 3', calc: true, duration: '1 hour', marks: 55 },
    ],
    versions: [
      { id: 'current', label: 'Current syllabus', detail: 'First exams 2021, last exams November 2028' },
      { id: 'new', label: 'New syllabus', detail: 'First teaching August 2027, first exams May 2029' },
    ],
    versionNote: 'The new course removes content rather than adding it. Topics marked "Leaves in 2029" are examined up to November 2028 only. The internal assessment moves to four criteria: problem specification, abstraction, computation and interpretation.',
    sections: [
      { slug: 'number-and-algebra', name: 'Number and Algebra', blurb: 'Binomial theorem, complex numbers and financial applications.' },
      { slug: 'calculus', name: 'Calculus', blurb: 'Maclaurin series and numerical methods.' },
      { slug: 'statistics-and-probability', name: 'Statistics and Probability', blurb: 'Correlation and regression.' },
    ],
  },
  {
    slug: 'ibdp-math-ai-sl', board: 'ib', code: 'AI SL', name: 'IB DP Mathematics: Applications and Interpretation SL',
    short: 'IBDP AI SL', level: 'ib-ai-sl', status: 'live',
    blurb: 'Technology is allowed on every paper, so GDC fluency matters as much as the maths.',
    papers: [
      { name: 'Paper 1', calc: true, duration: '1 hour 30 minutes', marks: 80 },
      { name: 'Paper 2', calc: true, duration: '1 hour 30 minutes', marks: 80 },
    ],
    sections: [
      { slug: 'geometry-and-trigonometry', name: 'Geometry and Trigonometry', blurb: 'Voronoi diagrams.' },
      { slug: 'statistics-and-probability', name: 'Statistics and Probability', blurb: 'The normal distribution.' },
    ],
  },
  { slug: 'ibdp-math-aa-sl', board: 'ib', code: 'AA SL', name: 'IB DP Mathematics: Analysis and Approaches SL', short: 'IBDP AA SL', level: 'ib-aa-sl', status: 'soon', blurb: 'Coming next.', papers: [], sections: [] },
  { slug: 'ibdp-math-ai-hl', board: 'ib', code: 'AI HL', name: 'IB DP Mathematics: Applications and Interpretation HL', short: 'IBDP AI HL', level: 'ib-ai-hl', status: 'soon', blurb: 'Coming next.', papers: [], sections: [] },
];

export const topics = [
  {
    id: 'binomial', syllabus: 'ibdp-math-aa-hl', section: 'number-and-algebra', slug: 'binomial-theorem', name: 'Binomial Theorem',
    summary: 'Expand powers of a binomial, pick out single terms and extend to rational powers.',
    generators: ['binomial-coefficient', 'arithmetic-series'],
    notes: {
      points: [
        R`The general term of $(a+b)^n$ is $\dbinom{n}{r}a^{\,n-r}b^{\,r}$, with $r$ starting at $0$.`,
        R`To find a particular power of $x$, write the general term, collect the powers of $x$ and solve for $r$.`,
        R`HL extension: for any rational $n$, $(1+x)^n=1+nx+\dfrac{n(n-1)}{2!}x^2+\ldots$, valid for $|x|<1$.`,
        R`For $(a+bx)^n$ with rational $n$, factor out $a^n$ first so the bracket starts with 1.`,
      ],
      formulas: [
        { label: 'Binomial theorem', tex: R`(a+b)^n=\sum_{r=0}^{n}\binom{n}{r}a^{\,n-r}b^{\,r}` },
        { label: 'Binomial coefficient', tex: R`\binom{n}{r}=\dfrac{n!}{r!\,(n-r)!}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Probability, Combinations gives nCr(n, r).`,
        R`Casio fx-CG50: OPTN, PROB, nCr.`,
      ],
      traps: [
        R`Forgetting to raise the coefficient: the $x^2$ term of $(1+2x)^6$ contains $(2x)^2=4x^2$.`,
        R`Quoting the series for rational $n$ without stating where it is valid.`,
      ],
    },
  },
  {
    id: 'complex', syllabus: 'ibdp-math-aa-hl', section: 'number-and-algebra', slug: 'complex-numbers-polar-form', name: 'Complex Numbers: Polar and Euler Form',
    summary: 'Convert between forms, use De Moivre and find roots of complex numbers.',
    generators: ['complex-modulus', 'log-evaluate'],
    notes: {
      points: [
        R`$z=a+bi$ has modulus $|z|=\sqrt{a^2+b^2}$ and argument $\theta$ with $\tan\theta=\dfrac{b}{a}$. Sketch it to pick the right quadrant.`,
        R`Polar form: $z=r(\cos\theta+i\sin\theta)=r\,\mathrm{cis}\,\theta=re^{i\theta}$.`,
        R`Multiplying: multiply the moduli and add the arguments. Dividing: divide and subtract.`,
        R`For $z^n=w$ there are $n$ roots, equally spaced by $\dfrac{2\pi}{n}$ around a circle.`,
      ],
      formulas: [
        { label: 'De Moivre', tex: R`\big[r(\cos\theta+i\sin\theta)\big]^n=r^n(\cos n\theta+i\sin n\theta)` },
        { label: 'Roots', tex: R`z_k=r^{1/n}\,e^{\,i\left(\frac{\theta+2k\pi}{n}\right)},\quad k=0,1,\ldots,n-1` },
      ],
      gdc: [
        R`TI-Nspire: set Real or Complex to Polar in Document Settings to convert automatically.`,
      ],
      traps: [
        R`Using $\arctan\dfrac{b}{a}$ blindly. For $-1+i$ the argument is $\dfrac{3\pi}{4}$, not $-\dfrac{\pi}{4}$.`,
        R`Giving only one root when the question asks to solve $z^3=w$.`,
      ],
    },
  },
  {
    id: 'finance', syllabus: 'ibdp-math-aa-hl', section: 'number-and-algebra', slug: 'financial-applications-compound-interest', name: 'Financial Applications: Compound Interest',
    removedIn: 'new',
    summary: 'Compound interest and depreciation as geometric sequences.',
    generators: [],
    notes: {
      points: [
        R`Compound growth is a geometric sequence: each period multiplies by the same factor.`,
        R`$k$ is the number of compounding periods per year: monthly means $k=12$.`,
        R`Depreciation uses the same formula with a negative rate.`,
        R`To find the time, use logarithms or the GDC finance solver, then round **up** to a whole period if the question asks when a target is first exceeded.`,
      ],
      formulas: [
        { label: 'Compound interest', tex: R`FV=PV\left(1+\dfrac{r}{100k}\right)^{kn}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Finance, Finance Solver. Enter PV as negative for money you pay in.`,
        R`Casio fx-CG50: Financial app, Compound Interest.`,
      ],
      traps: [
        R`Using $r$ as a decimal in a formula that already divides by 100.`,
        R`Rounding the multiplier early. Keep full accuracy until the final answer.`,
      ],
    },
  },
  {
    id: 'maclaurin', syllabus: 'ibdp-math-aa-hl', section: 'calculus', slug: 'maclaurin-series', name: 'Maclaurin Series',
    tag: 'Paper 3 favourite',
    summary: 'Build series from derivatives, combine standard series and use them to evaluate limits.',
    generators: ['differentiate-poly', 'integrate-poly'],
    notes: {
      points: [
        R`A Maclaurin series rebuilds a function from its derivatives at $x=0$.`,
        R`Know the standard series for $e^x$, $\sin x$, $\cos x$ and $\ln(1+x)$ from the formula booklet.`,
        R`New series from old: substitute (e.g. $x\to 2x$), multiply two series, differentiate or integrate term by term.`,
        R`For limits of the form $\dfrac00$, replace each function by its series and cancel the lowest power.`,
      ],
      formulas: [
        { label: 'Maclaurin series', tex: R`f(x)=f(0)+xf'(0)+\dfrac{x^2}{2!}f''(0)+\dfrac{x^3}{3!}f'''(0)+\ldots` },
        { label: 'Exponential', tex: R`e^x=1+x+\dfrac{x^2}{2!}+\dfrac{x^3}{3!}+\ldots` },
        { label: 'Sine', tex: R`\sin x=x-\dfrac{x^3}{3!}+\dfrac{x^5}{5!}-\ldots` },
        { label: 'Logarithm', tex: R`\ln(1+x)=x-\dfrac{x^2}{2}+\dfrac{x^3}{3}-\ldots` },
      ],
      gdc: [
        R`Check a series by graphing the function and your polynomial together near $x=0$. They should overlap.`,
      ],
      traps: [
        R`Substituting $2x$ but forgetting to cube the 2: $(2x)^3=8x^3$.`,
        R`When multiplying series, missing a cross term that contributes to the power you need.`,
      ],
    },
  },
  {
    id: 'euler', syllabus: 'ibdp-math-aa-hl', section: 'calculus', slug: 'eulers-method', name: "Euler's Method",
    removedIn: 'new',
    summary: 'Step-by-step numerical solutions of first-order differential equations.',
    generators: [],
    notes: {
      points: [
        R`Euler's method follows the tangent for a short step $h$, then recalculates the gradient.`,
        R`Set out a table with columns $n$, $x_n$, $y_n$ and $f(x_n,y_n)$.`,
        R`A smaller step size gives a better approximation but needs more steps.`,
      ],
      formulas: [
        { label: 'Iteration', tex: R`y_{n+1}=y_n+h\,f(x_n,y_n),\qquad x_{n+1}=x_n+h` },
      ],
      gdc: [
        R`TI-Nspire: use a Lists and Spreadsheet page with a recursive formula, or the sequence plot.`,
        R`Casio fx-CG50: Recursion app with $a_{n+1}$ and $b_{n+1}$ for $x$ and $y$.`,
      ],
      traps: [
        R`Updating $x$ before using it in the gradient for the same step.`,
        R`Rounding $y_n$ at each step. Carry full calculator accuracy.`,
      ],
    },
  },
  {
    id: 'bivariate', syllabus: 'ibdp-math-aa-hl', section: 'statistics-and-probability', slug: 'bivariate-data-correlation-and-regression', name: 'Bivariate Data: Correlation and Regression',
    removedIn: 'new',
    summary: 'Interpret correlation and use the regression line of y on x to predict.',
    generators: [],
    notes: {
      points: [
        R`Pearson's $r$ measures the strength of a **linear** relationship, from $-1$ to $1$.`,
        R`The regression line of $y$ on $x$ predicts $y$ from $x$, and always passes through $(\bar{x},\bar{y})$.`,
        R`Interpolation (inside the data range) is reliable when $|r|$ is close to 1. Extrapolation is not.`,
        R`The gradient is the change in $y$ for each one-unit increase in $x$. Say it in context.`,
      ],
      formulas: [
        { label: 'Regression line', tex: R`y=ax+b\ \text{ through }\ (\bar{x},\,\bar{y})` },
      ],
      gdc: [
        R`TI-Nspire: enter lists, then menu, Statistics, Stat Calculations, Linear Regression (mx+b).`,
        R`Casio fx-CG50: Statistics app, CALC, REG, X, ax+b.`,
      ],
      traps: [
        R`Using the $y$ on $x$ line to predict $x$ from $y$.`,
        R`Saying correlation proves that one variable causes the other.`,
      ],
    },
  },
  {
    id: 'voronoi', syllabus: 'ibdp-math-ai-sl', section: 'geometry-and-trigonometry', slug: 'voronoi-diagrams', name: 'Voronoi Diagrams',
    summary: 'Cells, edges and vertices, nearest-neighbour interpolation and the largest empty circle.',
    generators: ['linear-eq'],
    notes: {
      points: [
        R`Each **cell** contains all the points closer to its site than to any other site.`,
        R`Each **edge** lies on the perpendicular bisector of two sites.`,
        R`A **vertex** where three edges meet is the same distance from three sites.`,
        R`The point furthest from every site (the "toxic waste" problem) is at a vertex of the diagram.`,
      ],
      formulas: [
        { label: 'Perpendicular gradients', tex: R`m_1\times m_2=-1` },
        { label: 'Midpoint', tex: R`\left(\dfrac{x_1+x_2}{2},\ \dfrac{y_1+y_2}{2}\right)` },
      ],
      gdc: [
        R`Store the two bisector equations and use the intersection tool to find a vertex.`,
      ],
      traps: [
        R`Using the gradient of the line joining the sites instead of the perpendicular gradient.`,
        R`Forgetting that the bisector passes through the midpoint, not through a site.`,
      ],
    },
  },
  {
    id: 'normal', syllabus: 'ibdp-math-ai-sl', section: 'statistics-and-probability', slug: 'normal-distribution', name: 'Normal Distribution',
    summary: 'Probabilities, expected numbers and inverse normal calculations on the GDC.',
    generators: [],
    notes: {
      points: [
        R`$X\sim N(\mu,\sigma^2)$ is symmetric about the mean $\mu$.`,
        R`About 68% of values lie within one standard deviation of the mean, 95% within two and 99.7% within three.`,
        R`Use normal cdf for a probability and inverse normal when the probability is given and a value is wanted.`,
        R`Expected number = probability $\times$ number of trials.`,
      ],
      formulas: [
        { label: 'Standardising', tex: R`z=\dfrac{x-\mu}{\sigma}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Probability, Distributions, Normal Cdf (lower, upper, mean, sd).`,
        R`TI-Nspire inverse: Inverse Normal (area to the left, mean, sd).`,
        R`Casio fx-CG50: Statistics, DIST, NORM, Ncd or InvN.`,
      ],
      traps: [
        R`Entering the variance where the calculator wants the standard deviation.`,
        R`For $P(X>k)$ with inverse normal, convert to the area on the left first.`,
      ],
    },
  },
];

export const questions = [
  ['bi1', 'binomial', 'easy', 3, false, R`Find the coefficient of $x^3$ in the expansion of $(2+x)^5$.`, null,
    [['M1', R`$\dbinom{5}{3}(2)^2x^3$`], ['A1', R`$10\times 4$`], ['A1', R`$40$`]], R`$40$`],
  ['bi2', 'binomial', 'medium', 5, false, R`Find the term independent of $x$ in the expansion of $\left(x^2+\dfrac{2}{x}\right)^6$.`, null,
    [['M1', R`General term $\dbinom{6}{r}(x^2)^{6-r}\left(\dfrac{2}{x}\right)^r$`], ['M1', R`Power of $x$ is $12-3r$`], ['A1', R`$r=4$`], ['M1', R`$\dbinom{6}{4}\times 2^4$`], ['A1', R`$240$`]], R`$240$`],
  ['bi3', 'binomial', 'hard', 5, false, R`In the expansion of $(1+kx)^6$, where $k>0$, the coefficient of $x^2$ is $60$.`,
    [['a', R`Find the value of $k$.`, 3], ['b', R`Find the coefficient of $x^3$.`, 2]],
    [['M1', R`(a) $\dbinom{6}{2}k^2=60$`], ['A1', R`$15k^2=60$`], ['A1', R`$k=2$`], ['M1', R`(b) $\dbinom{6}{3}(2)^3$`], ['A1', R`$160$`]], R`(a) $k=2$  (b) $160$`],
  ['bi4', 'binomial', 'exam', 7, false, R`Consider $f(x)=\dfrac{1}{\sqrt{1-2x}}$.`,
    [['a', R`Expand $f(x)$ in ascending powers of $x$, up to and including the term in $x^2$.`, 4], ['b', R`State the values of $x$ for which the expansion is valid.`, 1], ['c', R`Use your expansion with $x=0.01$ to estimate $\dfrac{1}{\sqrt{0.98}}$.`, 2]],
    [['M1', R`(a) Writes $(1-2x)^{-\frac12}$`], ['M1', R`$1+\left(-\tfrac12\right)(-2x)+\dfrac{\left(-\frac12\right)\left(-\frac32\right)}{2!}(-2x)^2$`], ['A1', R`$1+x$`], ['A1', R`$+\tfrac32x^2$`], ['A1', R`(b) $|x|<\tfrac12$`], ['M1', R`(c) $1+0.01+\tfrac32(0.01)^2$`], ['A1', R`$1.01015$`]],
    R`(a) $1+x+\tfrac32x^2$  (b) $|x|<\tfrac12$  (c) $1.01015$`],

  ['cx1', 'complex', 'easy', 4, false, R`Let $z=1+i\sqrt{3}$. Find the modulus and argument of $z$.`, null,
    [['M1', R`$|z|=\sqrt{1+3}$`], ['A1', R`$|z|=2$`], ['M1', R`$\tan\theta=\sqrt3$`], ['A1', R`$\arg z=\dfrac{\pi}{3}$`]], R`$|z|=2,\ \arg z=\dfrac{\pi}{3}$`],
  ['cx2', 'complex', 'medium', 5, false, R`Use De Moivre's theorem to find $(1+i)^8$.`, null,
    [['M1', R`$|1+i|=\sqrt2$`], ['A1', R`$\arg(1+i)=\dfrac{\pi}{4}$`], ['M1', R`$(\sqrt2)^8\,\mathrm{cis}\left(8\times\dfrac{\pi}{4}\right)$`], ['A1', R`$16\,\mathrm{cis}\,2\pi$`], ['A1', R`$16$`]], R`$16$`],
  ['cx3', 'complex', 'hard', 6, false, R`Solve $z^3=8i$, giving your answers in the form $re^{i\theta}$ where $r>0$ and $0\le\theta<2\pi$.`, null,
    [['M1', R`$8i=8e^{i\frac{\pi}{2}}$`], ['M1', R`$r=\sqrt[3]{8}=2$`], ['M1', R`$\theta=\dfrac{\frac{\pi}{2}+2k\pi}{3}$`], ['A1', R`$2e^{i\frac{\pi}{6}}$`], ['A1', R`$2e^{i\frac{5\pi}{6}}$`], ['A1', R`$2e^{i\frac{3\pi}{2}}$`]],
    R`$2e^{i\frac{\pi}{6}},\ 2e^{i\frac{5\pi}{6}},\ 2e^{i\frac{3\pi}{2}}$`],

  ['fa1', 'finance', 'easy', 3, true, R`\$5000 is invested at 4% per year, compounded annually. Find the value of the investment after 6 years, to the nearest cent.`, null,
    [['M1', R`$5000\times1.04^6$`], ['A1', R`$6326.595\ldots$`], ['A1', R`\$6326.60`]], R`\$6326.60`],
  ['fa2', 'finance', 'medium', 5, true, R`\$2000 is invested at a nominal annual rate of 6%.`,
    [['a', R`The interest is compounded monthly. Find the value after 3 years.`, 3], ['b', R`If instead the interest is compounded annually, find the least number of complete years for the investment to double.`, 2]],
    [['M1', R`(a) $2000\left(1+\dfrac{6}{1200}\right)^{36}$`], ['A1', R`$2000\times1.005^{36}$`], ['A1', R`\$2393.36`], ['M1', R`(b) $1.06^n=2$, so $n=\dfrac{\ln 2}{\ln 1.06}=11.9$`], ['A1', R`$12$ years`]],
    R`(a) \$2393.36  (b) 12 years`],

  ['mc1', 'maclaurin', 'easy', 4, false, R`Find the Maclaurin series for $e^{2x}$ up to and including the term in $x^3$.`, null,
    [['M1', R`Substitutes $2x$ into the series for $e^x$`], ['A1', R`$1+2x$`], ['A1', R`$+2x^2$`], ['A1', R`$+\tfrac43x^3$`]], R`$1+2x+2x^2+\tfrac43x^3$`],
  ['mc2', 'maclaurin', 'medium', 5, false, R`Use the Maclaurin series for $\ln(1+x)$ to find the series for $\ln(1+2x)$ up to and including the term in $x^3$, and state the values of $x$ for which it is valid.`, null,
    [['M1', R`Replaces $x$ by $2x$`], ['A1', R`$2x$`], ['A1', R`$-2x^2$`], ['A1', R`$+\tfrac83x^3$`], ['A1', R`$-\tfrac12<x\le\tfrac12$`]], R`$2x-2x^2+\tfrac83x^3$, valid for $-\tfrac12<x\le\tfrac12$`],
  ['mc3', 'maclaurin', 'hard', 4, false, R`Use Maclaurin series to find $\displaystyle\lim_{x\to0}\frac{\sin x-x}{x^3}$.`, null,
    [['M1', R`$\sin x=x-\dfrac{x^3}{6}+\dfrac{x^5}{120}-\ldots$`], ['M1', R`$\dfrac{-\frac{x^3}{6}+\frac{x^5}{120}-\ldots}{x^3}$`], ['A1', R`$-\dfrac16+\dfrac{x^2}{120}-\ldots$`], ['A1', R`$-\dfrac16$`]], R`$-\dfrac16$`],
  ['mc4', 'maclaurin', 'exam', 6, false, R`Let $f(x)=e^x\sin x$.`,
    [['a', R`By multiplying two series, find the Maclaurin series for $f(x)$ up to and including the term in $x^3$.`, 4], ['b', R`Hence find $\displaystyle\lim_{x\to0}\frac{e^x\sin x-x}{x^2}$.`, 2]],
    [['M1', R`(a) $\left(1+x+\dfrac{x^2}{2}+\ldots\right)\left(x-\dfrac{x^3}{6}+\ldots\right)$`], ['A1', R`$x+x^2$`], ['M1', R`$x^3$ terms: $\dfrac12-\dfrac16$`], ['A1', R`$x+x^2+\dfrac{x^3}{3}$`], ['M1', R`(b) $\dfrac{x^2+\frac{x^3}{3}+\ldots}{x^2}$`], ['A1', R`$1$`]],
    R`(a) $x+x^2+\dfrac{x^3}{3}$  (b) $1$`],

  ['eu1', 'euler', 'medium', 5, true, R`Consider $\dfrac{dy}{dx}=x+y$ with $y=1$ when $x=0$. Use Euler's method with step size $0.1$ to approximate $y$ when $x=0.3$.`, null,
    [['M1', R`$y_{n+1}=y_n+0.1(x_n+y_n)$`], ['A1', R`$y_1=1.1$`], ['A1', R`$y_2=1.22$`], ['M1', R`$y_3=1.22+0.1(0.2+1.22)$`], ['A1', R`$y(0.3)\approx1.362$`]], R`$1.362$`],
  ['eu2', 'euler', 'hard', 5, true, R`Consider $\dfrac{dy}{dx}=2x-y$ with $y=2$ when $x=1$.`,
    [['a', R`Use Euler's method with step size $0.25$ to approximate $y$ when $x=1.5$.`, 4], ['b', R`State one way to improve the accuracy of the approximation.`, 1]],
    [['M1', R`(a) $y_{n+1}=y_n+0.25(2x_n-y_n)$`], ['A1', R`$y_1=2+0.25(2-2)=2$`], ['M1', R`$y_2=2+0.25(2.5-2)$`], ['A1', R`$y(1.5)\approx2.125$`], ['R1', R`(b) Use a smaller step size`]],
    R`(a) $2.125$  (b) smaller step size`],

  ['bv1', 'bivariate', 'easy', 4, true, R`For a group of students, $x$ is the number of hours spent revising and $y$ is the test score. The data has $1\le x\le10$ and the regression line of $y$ on $x$ is $y=2.4x+11$.`,
    [['a', R`Interpret the gradient of the line in context.`, 1], ['b', R`Estimate the score of a student who revises for 5 hours.`, 2], ['c', R`Explain why the line should not be used to estimate the score of a student who revises for 30 hours.`, 1]],
    [['R1', R`(a) Each extra hour of revision is associated with an increase of 2.4 marks`], ['M1', R`(b) $2.4(5)+11$`], ['A1', R`$23$`], ['R1', R`(c) 30 is outside the range of the data (extrapolation)`]],
    R`(b) $23$`],
  ['bv2', 'bivariate', 'medium', 4, true, R`A set of bivariate data has mean point $(6,\,20)$. The regression line of $y$ on $x$ is $y=1.5x+c$.`,
    [['a', R`Find the value of $c$.`, 2], ['b', R`Estimate the value of $y$ when $x=8$.`, 2]],
    [['M1', R`(a) Substitutes $(6,\,20)$: $20=1.5(6)+c$`], ['A1', R`$c=11$`], ['M1', R`(b) $1.5(8)+11$`], ['A1', R`$23$`]], R`(a) $c=11$  (b) $23$`],

  ['vo1', 'voronoi', 'easy', 3, true, R`Two sites are $A(2,\,1)$ and $B(6,\,5)$. Find the equation of the edge of the Voronoi diagram between the cells of $A$ and $B$.`, null,
    [['A1', R`Midpoint $(4,\,3)$`], ['M1', R`Gradient of $AB$ is $1$, so perpendicular gradient is $-1$`], ['A1', R`$y=-x+7$`]], R`$y=-x+7$`],
  ['vo2', 'voronoi', 'medium', 4, true, R`Three wells are at $A(0,\,0)$, $B(4,\,0)$ and $C(0,\,6)$, with distances in km.`,
    [['a', R`Find the coordinates of the vertex of the Voronoi diagram for these three sites.`, 3], ['b', R`Find the distance from this vertex to each well.`, 1]],
    [['M1', R`(a) Perpendicular bisector of $AB$: $x=2$`], ['M1', R`Perpendicular bisector of $AC$: $y=3$`], ['A1', R`$(2,\,3)$`], ['A1', R`(b) $\sqrt{2^2+3^2}=\sqrt{13}\approx3.61$ km`]],
    R`(a) $(2,\,3)$  (b) $3.61$ km`],

  ['nd1', 'normal', 'easy', 2, true, R`$X\sim N(50,\,8^2)$. Find $P(42<X<58)$.`, null,
    [['M1', R`Recognises one standard deviation either side of the mean, or uses normal cdf`], ['A1', R`$0.683$`]], R`$0.683$`],
  ['nd2', 'normal', 'medium', 4, true, R`The heights of a group of students are normally distributed with mean 170 cm and standard deviation 6 cm.`,
    [['a', R`Find the probability that a student chosen at random is taller than 180 cm.`, 2], ['b', R`There are 500 students. Find the expected number who are taller than 180 cm.`, 2]],
    [['M1', R`(a) Normal cdf with lower bound 180, mean 170, sd 6`], ['A1', R`$0.0478$`], ['M1', R`(b) $500\times0.0478$`], ['A1', R`$23.9$, about 24 students`]], R`(a) $0.0478$  (b) about 24`],
  ['nd3', 'normal', 'hard', 3, true, R`$X\sim N(170,\,6^2)$. Find the value of $k$ such that $P(X<k)=0.9$.`, null,
    [['M1', R`Inverse normal with area $0.9$`], ['A1', R`$z=1.2816$`], ['A1', R`$k=177.7$`]], R`$k\approx177.7$`],
];
