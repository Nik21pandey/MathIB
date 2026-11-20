// IB Diploma Mathematics - original MathIB content.
const R = String.raw;

export const syllabuses = [
  {
    slug: 'ibdp-math-aa-hl', board: 'ib', code: 'AA HL', name: 'IB DP Mathematics: Analysis and Approaches HL',
    short: 'IBDP AA HL', level: 'ib-aa-hl', status: 'live',
    blurb: 'Complete 5-unit curriculum: Number & Algebra, Functions, Geometry & Trig, Statistics & Probability, and Calculus.',
    papers: [
      { name: 'Paper 1 (Non-Calculator)', calc: false, duration: '2 hours', marks: 110 },
      { name: 'Paper 2 (Calculator)', calc: true, duration: '2 hours', marks: 110 },
      { name: 'Paper 3 (Extended Problem Solving)', calc: true, duration: '1 hour', marks: 55 },
    ],
    versions: [
      { id: 'current', label: 'Current syllabus', detail: 'First exams 2021, last exams November 2028' },
      { id: 'new', label: 'New syllabus', detail: 'First teaching August 2027, first exams May 2029' },
    ],
    versionNote: 'The new course streamlines content. Topics marked "Leaves in 2029" are examined up to November 2028 only.',
    sections: [
      { slug: 'number-and-algebra', name: 'Topic 1: Number and Algebra', blurb: 'Binomial theorem, complex numbers, proof by induction, and systems of equations.' },
      { slug: 'functions', name: 'Topic 2: Functions', blurb: 'Polynomials, rational functions, composite and inverse functions.' },
      { slug: 'geometry-and-trigonometry', name: 'Topic 3: Geometry and Trigonometry', blurb: 'Trigonometric identities, 3D vectors, cross products, and lines & planes.' },
      { slug: 'statistics-and-probability', name: 'Topic 4: Statistics and Probability', blurb: 'Correlation, probability distributions, normal and Poisson distributions.' },
      { slug: 'calculus', name: 'Topic 5: Calculus', blurb: 'Maclaurin series, advanced integration, differential equations, and Euler\'s method.' },
    ],
  },
  {
    slug: 'ibdp-math-aa-sl', board: 'ib', code: 'AA SL', name: 'IB DP Mathematics: Analysis and Approaches SL',
    short: 'IBDP AA SL', level: 'ib-aa-sl', status: 'live',
    blurb: 'Analytical mathematics for STEM, sciences and economics. Non-calculator paper 1 and calculator paper 2.',
    papers: [
      { name: 'Paper 1 (Non-Calculator)', calc: false, duration: '1 hour 30 minutes', marks: 80 },
      { name: 'Paper 2 (Calculator)', calc: true, duration: '1 hour 30 minutes', marks: 80 },
    ],
    sections: [
      { slug: 'number-and-algebra', name: 'Topic 1: Number and Algebra', blurb: 'Sequences, series, exponents and logarithms.' },
      { slug: 'functions', name: 'Topic 2: Functions', blurb: 'Quadratic functions, composite & inverse functions, transformations.' },
      { slug: 'geometry-and-trigonometry', name: 'Topic 3: Geometry and Trigonometry', blurb: 'Sine and cosine rules, radian measure and trigonometric identities.' },
      { slug: 'statistics-and-probability', name: 'Topic 4: Statistics and Probability', blurb: 'Descriptive statistics, Venn & tree diagrams, binomial & normal distributions.' },
      { slug: 'calculus', name: 'Topic 5: Calculus', blurb: 'Differentiation, tangents, optimization, integration and area between curves.' },
    ],
  },
  {
    slug: 'ibdp-math-ai-sl', board: 'ib', code: 'AI SL', name: 'IB DP Mathematics: Applications and Interpretation SL',
    short: 'IBDP AI SL', level: 'ib-ai-sl', status: 'live',
    blurb: 'Applied mathematical modeling, statistics, Voronoi diagrams and financial maths with active GDC technology.',
    papers: [
      { name: 'Paper 1 (Calculator)', calc: true, duration: '1 hour 30 minutes', marks: 80 },
      { name: 'Paper 2 (Calculator)', calc: true, duration: '1 hour 30 minutes', marks: 80 },
    ],
    sections: [
      { slug: 'number-and-algebra', name: 'Topic 1: Number and Algebra', blurb: 'Scientific notation, error bounds and financial mathematics.' },
      { slug: 'functions', name: 'Topic 2: Functions', blurb: 'Linear, exponential, power and sinusoidal models.' },
      { slug: 'geometry-and-trigonometry', name: 'Topic 3: Geometry and Trigonometry', blurb: 'Voronoi diagrams, perpendicular bisectors and 3D trigonometry.' },
      { slug: 'statistics-and-probability', name: 'Topic 4: Statistics and Probability', blurb: 'Normal distribution, Spearman\'s rank and Chi-squared independence tests.' },
      { slug: 'calculus', name: 'Topic 5: Calculus', blurb: 'Differentiation, rates of change and optimization on GDC.' },
    ],
  },
  {
    slug: 'ibdp-math-ai-hl', board: 'ib', code: 'AI HL', name: 'IB DP Mathematics: Applications and Interpretation HL',
    short: 'IBDP AI HL', level: 'ib-ai-hl', status: 'live',
    blurb: 'Advanced modeling, matrices, graph theory, differential equations and multivariate statistics.',
    papers: [
      { name: 'Paper 1 (Calculator)', calc: true, duration: '2 hours', marks: 110 },
      { name: 'Paper 2 (Calculator)', calc: true, duration: '2 hours', marks: 110 },
      { name: 'Paper 3 (Extended Investigation)', calc: true, duration: '1 hour', marks: 55 },
    ],
    sections: [
      { slug: 'number-and-algebra', name: 'Topic 1: Number and Algebra', blurb: 'Matrices, eigenvalues and Markov chains.' },
      { slug: 'functions', name: 'Topic 2: Functions', blurb: 'Logarithmic, logistic models and non-linear regression.' },
      { slug: 'geometry-and-trigonometry', name: 'Topic 3: Geometry and Trigonometry', blurb: 'Graph theory, adjacency matrices and Dijkstra\'s algorithm.' },
      { slug: 'statistics-and-probability', name: 'Topic 4: Statistics and Probability', blurb: 'Poisson distribution, confidence intervals and hypothesis testing.' },
      { slug: 'calculus', name: 'Topic 5: Calculus', blurb: 'Coupled linear differential equations and phase portraits.' },
    ],
  },
];

export const topics = [
  // --- IBDP AA HL Topics ---
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
    id: 'proofs', syllabus: 'ibdp-math-aa-hl', section: 'number-and-algebra', slug: 'proof-by-induction-and-contradiction', name: 'Proof: Induction and Contradiction',
    tag: 'HL Core',
    summary: 'Master the 4-step mathematical induction structure and proof by contradiction.',
    generators: [],
    notes: {
      points: [
        R`Induction Step 1 (Base Case): Verify the statement is true for $n=1$ (or specified starting integer).`,
        R`Induction Step 2 (Hypothesis): Assume the statement is true for $n=k$, where $k \in \mathbb{Z}^+$.`,
        R`Induction Step 3 (Inductive Step): Prove that truth for $n=k$ implies truth for $n=k+1$. State $P(k+1)$ clearly before working.`,
        R`Induction Step 4 (Conclusion): "Since true for $n=1$, and true for $n=k \implies$ true for $n=k+1$, by mathematical induction true for all $n \in \mathbb{Z}^+$."`,
        R`Proof by Contradiction: Assume the negation of the proposition and deduce a logical impossibility.`,
      ],
      formulas: [
        { label: 'Divisibility induction', tex: R`f(k+1)-f(k) = m \cdot g(k)` },
        { label: 'Series sum induction', tex: R`S_{k+1} = S_k + u_{k+1}` },
      ],
      gdc: [],
      traps: [
        R`Writing the conclusion without linking the base case and the implication step.`,
        R`Assuming $P(k+1)$ is true during the proof rather than deriving it.`,
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
      ],
      formulas: [
        { label: 'Compound interest', tex: R`FV=PV\left(1+\dfrac{r}{100k}\right)^{kn}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Finance, Finance Solver. Enter PV as negative for money paid in.`,
      ],
      traps: [
        R`Using $r$ as a decimal in a formula that already divides by 100.`,
      ],
    },
  },
  {
    id: 'quadratics-poly', syllabus: 'ibdp-math-aa-hl', section: 'functions', slug: 'polynomials-roots-coefficients', name: 'Polynomials and Root Relations',
    tag: 'HL Core',
    summary: 'Remainder theorem, factor theorem, and relations between roots and coefficients.',
    generators: [],
    notes: {
      points: [
        R`Remainder Theorem: When polynomial $P(x)$ is divided by $(x-c)$, the remainder is $R = P(c)$.`,
        R`Factor Theorem: $(x-c)$ is a factor of $P(x)$ if and only if $P(c) = 0$.`,
        R`Sum of roots for $ax^n + bx^{n-1} + \ldots = 0$: $\sum \alpha = -\frac{b}{a}$.`,
        R`Product of roots: $\prod \alpha = (-1)^n \frac{a_0}{a_n}$.`,
      ],
      formulas: [
        { label: 'Factor theorem', tex: R`P(c)=0 \iff (x-c) \mid P(x)` },
        { label: 'Vieta sum of roots', tex: R`\alpha_1+\alpha_2+\ldots+\alpha_n = -\dfrac{b}{a}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Algebra, Polynomial Tools, Find Roots of Polynomial.`,
      ],
      traps: [
        R`Sign error when applying the remainder theorem with $(ax-b)$: evaluate at $x = +b/a$.`,
      ],
    },
  },
  {
    id: 'trig-identities', syllabus: 'ibdp-math-aa-hl', section: 'geometry-and-trigonometry', slug: 'trigonometric-identities-and-equations', name: 'Trigonometric Identities and Double-Angle Equations',
    tag: 'HL Core',
    summary: 'Compound angle formulae, double-angle identities, and reciprocal functions (sec, csc, cot).',
    generators: [],
    notes: {
      points: [
        R`Reciprocal functions: $\sec x = \frac{1}{\cos x}$, $\csc x = \frac{1}{\sin x}$, $\cot x = \frac{1}{\tan x}$.`,
        R`Pythagorean identities: $\sin^2 x + \cos^2 x = 1$, $1 + \tan^2 x = \sec^2 x$, $1 + \cot^2 x = \csc^2 x$.`,
        R`Double angle: $\sin 2x = 2\sin x \cos x$, $\cos 2x = \cos^2 x - \sin^2 x = 2\cos^2 x - 1 = 1 - 2\sin^2 x$.`,
        R`Always check the specified domain (e.g. $0 \le x \le 2\pi$) and include all valid quadrants.`,
      ],
      formulas: [
        { label: 'Double angle sine', tex: R`\sin 2\theta = 2\sin\theta\cos\theta` },
        { label: 'Double angle cosine', tex: R`\cos 2\theta = 2\cos^2\theta - 1` },
      ],
      gdc: [],
      traps: [
        R`Dividing by $\sin x$ across an equation and losing the $x = 0$ or $x = \pi$ roots. Always factor instead.`,
      ],
    },
  },
  {
    id: 'vectors-planes', syllabus: 'ibdp-math-aa-hl', section: 'geometry-and-trigonometry', slug: 'vectors-cross-product-and-planes', name: '3D Vectors, Cross Product and Planes',
    tag: 'Paper 2 & 3',
    summary: 'Vector equations of lines, scalar and vector products, and equations of planes in 3D.',
    generators: [],
    notes: {
      points: [
        R`Dot product: $\vec{a} \cdot \vec{b} = |\vec{a}||\vec{b}|\cos\theta$. If dot product is $0$, vectors are perpendicular.`,
        R`Cross product: $\vec{a} \times \vec{b}$ produces a vector perpendicular to both $\vec{a}$ and $\vec{b}$, with magnitude equal to the parallelogram area.`,
        R`Vector equation of a line: $\vec{r} = \vec{a} + \lambda \vec{d}$.`,
        R`Cartesian equation of a plane: $n_1 x + n_2 y + n_3 z = d$, where $\vec{n} = (n_1, n_2, n_3)$ is normal to the plane.`,
      ],
      formulas: [
        { label: 'Angle between vectors', tex: R`\cos\theta = \dfrac{\vec{a}\cdot\vec{b}}{|\vec{a}||\vec{b}|}` },
        { label: 'Cartesian plane', tex: R`\vec{r}\cdot\vec{n} = \vec{a}\cdot\vec{n} = d` },
      ],
      gdc: [
        R`TI-Nspire: menu, Matrix & Vector, Vector, Cross Product and Dot Product.`,
      ],
      traps: [
        R`Using the direction vector of a line instead of the normal vector when calculating the angle between a line and a plane.`,
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
        R`Interpolation is reliable when $|r|$ is close to 1. Extrapolation is not.`,
      ],
      formulas: [
        { label: 'Regression line', tex: R`y=ax+b\ \text{ through }\ (\bar{x},\,\bar{y})` },
      ],
      gdc: [
        R`TI-Nspire: menu, Statistics, Stat Calculations, Linear Regression.`,
      ],
      traps: [
        R`Using the $y$ on $x$ line to predict $x$ from $y$.`,
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
        R`New series from old: substitute, multiply two series, differentiate or integrate term by term.`,
      ],
      formulas: [
        { label: 'Maclaurin series', tex: R`f(x)=f(0)+xf'(0)+\dfrac{x^2}{2!}f''(0)+\ldots` },
      ],
      gdc: [],
      traps: [
        R`Substituting $2x$ but forgetting to cube the 2: $(2x)^3=8x^3$.`,
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
        R`A smaller step size gives a better approximation but needs more steps.`,
      ],
      formulas: [
        { label: 'Iteration', tex: R`y_{n+1}=y_n+h\,f(x_n,y_n),\qquad x_{n+1}=x_n+h` },
      ],
      gdc: [],
      traps: [
        R`Updating $x$ before using it in the gradient for the same step.`,
      ],
    },
  },

  // --- IBDP AA SL Topics ---
  {
    id: 'aa-sl-sequences', syllabus: 'ibdp-math-aa-sl', section: 'number-and-algebra', slug: 'arithmetic-and-geometric-sequences', name: 'Arithmetic and Geometric Sequences',
    tag: 'SL Core',
    summary: 'Find nth terms, sums of series, and solve geometric series with infinite sums.',
    generators: ['arithmetic-series'],
    notes: {
      points: [
        R`Arithmetic: $u_n = u_1 + (n-1)d$, common difference $d = u_{k+1} - u_k$.`,
        R`Sum of arithmetic series: $S_n = \frac{n}{2}(2u_1 + (n-1)d) = \frac{n}{2}(u_1 + u_n)$.`,
        R`Geometric: $u_n = u_1 r^{n-1}$, common ratio $r = \frac{u_{k+1}}{u_k}$.`,
        R`Infinite geometric series converges if and only if $|r| < 1$, with sum $S_\infty = \frac{u_1}{1-r}$.`,
      ],
      formulas: [
        { label: 'Arithmetic sum', tex: R`S_n = \dfrac{n}{2}(2u_1 + (n-1)d)` },
        { label: 'Infinite sum', tex: R`S_\infty = \dfrac{u_1}{1-r},\quad |r|<1` },
      ],
      gdc: [],
      traps: [
        R`Attempting to calculate $S_\infty$ when $|r| \ge 1$.`,
      ],
    },
  },
  {
    id: 'aa-sl-functions', syllabus: 'ibdp-math-aa-sl', section: 'functions', slug: 'quadratic-and-exponential-functions', name: 'Quadratic Functions and Graph Transformations',
    tag: 'SL Core',
    summary: 'Roots, vertex form, discriminant tests, and function transformations.',
    generators: [],
    notes: {
      points: [
        R`Discriminant $\Delta = b^2 - 4ac$: $>0$ (two real roots), $=0$ (one repeated root), $<0$ (no real roots).`,
        R`Vertex form: $y = a(x-h)^2 + k$, vertex at $(h, k)$, axis of symmetry $x = h$.`,
        R`Transformations: $f(x+a)$ moves left by $a$; $f(x)+b$ moves up by $b$; $af(x)$ vertical stretch by scale factor $a$.`,
      ],
      formulas: [
        { label: 'Discriminant', tex: R`\Delta = b^2 - 4ac` },
        { label: 'Vertex coordinates', tex: R`x = -\dfrac{b}{2a}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Analyze Graph, Zero / Minimum / Maximum.`,
      ],
      traps: [
        R`Confusing $f(x-3)$ (shift right by 3) with $f(x)-3$ (shift down by 3).`,
      ],
    },
  },
  {
    id: 'aa-sl-trig', syllabus: 'ibdp-math-aa-sl', section: 'geometry-and-trigonometry', slug: 'sine-and-cosine-rules-circular-measure', name: 'Sine and Cosine Rules and Circular Measure',
    tag: 'SL Core',
    summary: 'Radian measure, arc length, sector area, and non-right-angled triangle trigonometry.',
    generators: [],
    notes: {
      points: [
        R`Arc length: $l = r\theta$ where $\theta$ is in radians.`,
        R`Sector area: $A = \frac{1}{2}r^2\theta$.`,
        R`Sine rule: $\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}$. Beware the ambiguous case (obtuse angle).`,
        R`Cosine rule for sides: $a^2 = b^2 + c^2 - 2bc\cos A$. For angles: $\cos A = \frac{b^2+c^2-a^2}{2bc}$.`,
      ],
      formulas: [
        { label: 'Sector area', tex: R`A = \tfrac12 r^2 \theta` },
        { label: 'Cosine rule', tex: R`a^2 = b^2 + c^2 - 2bc\cos A` },
      ],
      gdc: [],
      traps: [
        R`Calculator set to Degree mode when using $\theta$ in radians for arc length.`,
      ],
    },
  },
  {
    id: 'aa-sl-calculus', syllabus: 'ibdp-math-aa-sl', section: 'calculus', slug: 'differentiation-tangents-and-optimization', name: 'Differentiation: Tangents, Normals and Turning Points',
    tag: 'SL Core',
    summary: 'Power rule, chain rule, product and quotient rules, tangents and optimization.',
    generators: ['differentiate-poly'],
    notes: {
      points: [
        R`Tangent at $(x_1, y_1)$ has gradient $m = f'(x_1)$. Normal has gradient $-\frac{1}{m}$.`,
        R`Stationary points occur where $f'(x) = 0$. Use $f''(x)$ to classify: $>0$ is local minimum, $<0$ is local maximum.`,
      ],
      formulas: [
        { label: 'Product rule', tex: R`(uv)' = u'v + uv'` },
        { label: 'Quotient rule', tex: R`\left(\dfrac{u}{v}\right)' = \dfrac{u'v - uv'}{v^2}` },
      ],
      gdc: [],
      traps: [
        R`Forgetting the chain rule when differentiating composite functions like $(3x-1)^4$.`,
      ],
    },
  },

  // --- IBDP AI SL Topics ---
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
        R`About 68% of values lie within $1\sigma$ of the mean, 95% within $2\sigma$ and 99.7% within $3\sigma$.`,
        R`Use normal cdf for a probability and inverse normal when the probability is given and a value is wanted.`,
        R`Expected number = probability $\times$ number of trials.`,
      ],
      formulas: [
        { label: 'Standardising', tex: R`z=\dfrac{x-\mu}{\sigma}` },
      ],
      gdc: [
        R`TI-Nspire: menu, Probability, Distributions, Normal Cdf (lower, upper, mean, sd).`,
      ],
      traps: [
        R`Entering the variance where the calculator wants the standard deviation.`,
      ],
    },
  },
  {
    id: 'ai-sl-chi', syllabus: 'ibdp-math-ai-sl', section: 'statistics-and-probability', slug: 'chi-squared-independence-test', name: 'Chi-Squared (\chi^2) Test of Independence',
    tag: 'AI Core',
    summary: 'Contingency tables, expected frequencies, degrees of freedom, and p-value decision rule.',
    generators: [],
    notes: {
      points: [
        R`Null hypothesis $H_0$: The two variables are independent. Alternative $H_1$: The two variables are not independent.`,
        R`Expected frequency for a cell: $f_e = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}}$. All expected frequencies must be $\ge 5$.`,
        R`Degrees of freedom: $\nu = (r-1)(c-1)$.`,
        R`Decision rule: Reject $H_0$ if $p < \alpha$ (significance level, typically $0.05$) or if $\chi^2_{\text{calc}} > \chi^2_{\text{crit}}$.`,
      ],
      formulas: [
        { label: 'Chi-squared statistic', tex: R`\chi^2 = \sum \dfrac{(f_o - f_e)^2}{f_e}` },
        { label: 'Degrees of freedom', tex: R`\nu = (r-1)(c-1)` },
      ],
      gdc: [
        R`TI-Nspire: Enter observed table in Matrix, menu, Statistics, Stat Tests, $\chi^2$ 2-way Test.`,
      ],
      traps: [
        R`Failing to state $H_0$ and $H_1$ in complete, contextual sentences.`,
      ],
    },
  },

  // --- IBDP AI HL Topics ---
  {
    id: 'ai-hl-matrices', syllabus: 'ibdp-math-ai-hl', section: 'number-and-algebra', slug: 'matrices-and-markov-chains', name: 'Matrices, Eigenvalues and Markov Chains',
    tag: 'AI HL',
    summary: 'Matrix multiplication, determinants, inverses, eigenvalues, eigenvectors, and steady-state probabilities.',
    generators: [],
    notes: {
      points: [
        R`A transition matrix $T$ has columns (or rows depending on convention) summing to 1.`,
        R`State vector at step $n$: $S_n = T^n S_0$.`,
        R`Steady state vector $S_\infty$ satisfies $T S_\infty = S_\infty$, with the sum of elements equal to 1.`,
      ],
      formulas: [
        { label: 'Steady state', tex: R`T \mathbf{s} = \mathbf{s}` },
      ],
      gdc: [
        R`TI-Nspire: Raise matrix to a large power (e.g. $T^{50}$) to inspect numerical convergence.`,
      ],
      traps: [
        R`Multiplying in the wrong order: matrix multiplication is non-commutative ($AB \ne BA$).`,
      ],
    },
  },
  {
    id: 'ai-hl-graphs', syllabus: 'ibdp-math-ai-hl', section: 'geometry-and-trigonometry', slug: 'graph-theory-trees-and-dijkstra', name: 'Graph Theory, Trees and Dijkstra Algorithm',
    tag: 'AI HL',
    summary: 'Vertices, edges, Eulerian and Hamiltonian paths, Kruskal & Prim MST, and Dijkstra shortest path.',
    generators: [],
    notes: {
      points: [
        R`Eulerian trail: visits every **edge** once. Exists iff graph has 0 or 2 vertices of odd degree.`,
        R`Hamiltonian cycle: visits every **vertex** once.`,
        R`A tree with $n$ vertices has exactly $n-1$ edges and contains no cycles.`,
        R`Dijkstra\'s algorithm finds the shortest path from a start vertex to all other vertices.`,
      ],
      formulas: [
        { label: 'Handshaking lemma', tex: R`\sum \deg(v) = 2e` },
      ],
      gdc: [],
      traps: [
        R`Confusing Eulerian (every edge) with Hamiltonian (every vertex).`,
      ],
    },
  },
];

export const questions = [
  // Binomial
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

  // Complex
  ['cx1', 'complex', 'easy', 4, false, R`Let $z=1+i\sqrt{3}$. Find the modulus and argument of $z$.`, null,
    [['M1', R`$|z|=\sqrt{1+3}$`], ['A1', R`$|z|=2$`], ['M1', R`$\tan\theta=\sqrt3$`], ['A1', R`$\arg z=\dfrac{\pi}{3}$`]], R`$|z|=2,\ \arg z=\dfrac{\pi}{3}$`],
  ['cx2', 'complex', 'medium', 5, false, R`Use De Moivre's theorem to find $(1+i)^8$.`, null,
    [['M1', R`$|1+i|=\sqrt2$`], ['A1', R`$\arg(1+i)=\dfrac{\pi}{4}$`], ['M1', R`$(\sqrt2)^8\,\mathrm{cis}\left(8\times\dfrac{\pi}{4}\right)$`], ['A1', R`$16\,\mathrm{cis}\,2\pi$`], ['A1', R`$16$`]], R`$16$`],
  ['cx3', 'complex', 'hard', 6, false, R`Solve $z^3=8i$, giving your answers in the form $re^{i\theta}$ where $r>0$ and $0\le\theta<2\pi$.`, null,
    [['M1', R`$8i=8e^{i\frac{\pi}{2}}$`], ['M1', R`$r=\sqrt[3]{8}=2$`], ['M1', R`$\theta=\dfrac{\frac{\pi}{2}+2k\pi}{3}$`], ['A1', R`$2e^{i\frac{\pi}{6}}$`], ['A1', R`$2e^{i\frac{5\pi}{6}}$`], ['A1', R`$2e^{i\frac{3\pi}{2}}$`]],
    R`$2e^{i\frac{\pi}{6}},\ 2e^{i\frac{5\pi}{6}},\ 2e^{i\frac{3\pi}{2}}$`],

  // Proofs
  ['pf1', 'proofs', 'easy', 4, false, R`Prove by induction that $\sum_{r=1}^{n} r = \dfrac{n(n+1)}{2}$ for all $n \in \mathbb{Z}^+$.`, null,
    [['M1', R`Base case: For $n=1$, LHS$=1$, RHS$=\frac{1(2)}{2}=1$, so true for $n=1$`], ['M1', R`Assume true for $n=k$: $\sum_{r=1}^{k} r = \frac{k(k+1)}{2}$`], ['M1', R`For $n=k+1$: $\frac{k(k+1)}{2} + (k+1) = (k+1)\left(\frac{k}{2}+1\right) = \frac{(k+1)(k+2)}{2}$`], ['R1', R`Concludes valid by mathematical induction for all $n \in \mathbb{Z}^+$`]], R`Proved by induction`],
  ['pf2', 'proofs', 'medium', 5, false, R`Prove by induction that $3^{2n} - 1$ is divisible by $8$ for all $n \in \mathbb{Z}^+$.`, null,
    [['M1', R`For $n=1$: $3^2 - 1 = 8 = 8(1)$, true for $n=1$`], ['M1', R`Assume $3^{2k} - 1 = 8m$ for integer $m$`], ['M1', R`For $n=k+1$: $3^{2(k+1)} - 1 = 9(3^{2k}) - 1$`], ['A1', R`$= 9(8m+1)-1 = 72m + 8 = 8(9m+1)$, which is divisible by 8`], ['R1', R`Induction conclusion`]], R`Proved by induction`],

  // Polynomials
  ['pl1', 'quadratics-poly', 'easy', 3, false, R`When $P(x) = 2x^3 - x^2 + kx - 5$ is divided by $(x-2)$, the remainder is $7$. Find the value of $k$.`, null,
    [['M1', R`Sets $P(2) = 7$`], ['M1', R`$2(8) - 4 + 2k - 5 = 7 \implies 7 + 2k = 7$`], ['A1', R`$k = 0$`]], R`$k=0$`],

  // Trig identities
  ['tr1', 'trig-identities', 'easy', 4, false, R`Solve $\sin 2x = \cos x$ for $0 \le x \le \pi$.`, null,
    [['M1', R`$2\sin x \cos x - \cos x = 0$`], ['A1', R`$\cos x(2\sin x - 1) = 0$`], ['A1', R`$\cos x = 0 \implies x = \frac{\pi}{2}$`], ['A1', R`$\sin x = \frac12 \implies x = \frac{\pi}{6},\ \frac{5\pi}{6}$`]], R`$x = \frac{\pi}{6},\ \frac{\pi}{2},\ \frac{5\pi}{6}$`],

  // Vectors & planes
  ['vp1', 'vectors-planes', 'easy', 4, false, R`Find a vector perpendicular to both $\vec{a} = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$ and $\vec{b} = \begin{pmatrix} 0 \\ 1 \\ 3 \end{pmatrix}$.`, null,
    [['M1', R`Evaluates $\vec{a} \times \vec{b}$`], ['A1', R`$i(6 - 0) = 6$`], ['A1', R`$j(0 - 3) = -3$`], ['A1', R`$k(1 - 0) = 1$, so $\begin{pmatrix} 6 \\ -3 \\ 1 \end{pmatrix}$`]], R`$\begin{pmatrix} 6 \\ -3 \\ 1 \end{pmatrix}$`],

  // Finance
  ['fa1', 'finance', 'easy', 3, true, R`\$5000 is invested at 4% per year, compounded annually. Find the value of the investment after 6 years, to the nearest cent.`, null,
    [['M1', R`$5000\times1.04^6$`], ['A1', R`$6326.595\ldots$`], ['A1', R`\$6326.60`]], R`\$6326.60`],
  ['fa2', 'finance', 'medium', 5, true, R`\$2000 is invested at a nominal annual rate of 6%.`,
    [['a', R`The interest is compounded monthly. Find the value after 3 years.`, 3], ['b', R`If instead the interest is compounded annually, find the least number of complete years for the investment to double.`, 2]],
    [['M1', R`(a) $2000\left(1+\dfrac{6}{1200}\right)^{36}$`], ['A1', R`$2000\times1.005^{36}$`], ['A1', R`\$2393.36`], ['M1', R`(b) $1.06^n=2$, so $n=\dfrac{\ln 2}{\ln 1.06}=11.9$`], ['A1', R`$12$ years`]],
    R`(a) \$2393.36  (b) 12 years`],

  // Bivariate
  ['bv1', 'bivariate', 'easy', 4, true, R`For a group of students, $x$ is the number of hours spent revising and $y$ is the test score. The data has $1\le x\le10$ and the regression line of $y$ on $x$ is $y=2.4x+11$.`,
    [['a', R`Interpret the gradient of the line in context.`, 1], ['b', R`Estimate the score of a student who revises for 5 hours.`, 2], ['c', R`Explain why the line should not be used to estimate the score of a student who revises for 30 hours.`, 1]],
    [['R1', R`(a) Each extra hour of revision is associated with an increase of 2.4 marks`], ['M1', R`(b) $2.4(5)+11$`], ['A1', R`$23$`], ['R1', R`(c) 30 is outside the range of the data (extrapolation)`]],
    R`(b) $23$`],
  ['bv2', 'bivariate', 'medium', 4, true, R`A set of bivariate data has mean point $(6,\,20)$. The regression line of $y$ on $x$ is $y=1.5x+c$.`,
    [['a', R`Find the value of $c$.`, 2], ['b', R`Estimate the value of $y$ when $x=8$.`, 2]],
    [['M1', R`(a) Substitutes $(6,\,20)$: $20=1.5(6)+c$`], ['A1', R`$c=11$`], ['M1', R`(b) $1.5(8)+11$`], ['A1', R`$23$`]], R`(a) $c=11$  (b) $23$`],

  // Maclaurin
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

  // Euler
  ['eu1', 'euler', 'medium', 5, true, R`Consider $\dfrac{dy}{dx}=x+y$ with $y=1$ when $x=0$. Use Euler's method with step size $0.1$ to approximate $y$ when $x=0.3$.`, null,
    [['M1', R`$y_{n+1}=y_n+0.1(x_n+y_n)$`], ['A1', R`$y_1=1.1$`], ['A1', R`$y_2=1.22$`], ['M1', R`$y_3=1.22+0.1(0.2+1.22)$`], ['A1', R`$y(0.3)\approx1.362$`]], R`$1.362$`],
  ['eu2', 'euler', 'hard', 5, true, R`Consider $\dfrac{dy}{dx}=2x-y$ with $y=2$ when $x=1$.`,
    [['a', R`Use Euler's method with step size $0.25$ to approximate $y$ when $x=1.5$.`, 4], ['b', R`State one way to improve the accuracy of the approximation.`, 1]],
    [['M1', R`(a) $y_{n+1}=y_n+0.25(2x_n-y_n)$`], ['A1', R`$y_1=2+0.25(2-2)=2$`], ['M1', R`$y_2=2+0.25(2.5-2)$`], ['A1', R`$y(1.5)\approx2.125$`], ['R1', R`(b) Use a smaller step size`]],
    R`(a) $2.125$  (b) smaller step size`],

  // AA SL Sequences
  ['asq1', 'aa-sl-sequences', 'easy', 4, false, R`The first three terms of an arithmetic sequence are $5, 8, 11$. Find the 20th term and the sum of the first 20 terms.`, null,
    [['M1', R`$u_1 = 5, d = 3$`], ['A1', R`$u_{20} = 5 + 19(3) = 62$`], ['M1', R`$S_{20} = \frac{20}{2}(5 + 62)$`], ['A1', R`$S_{20} = 670$`]], R`$u_{20} = 62,\ S_{20} = 670$`],

  // AA SL Functions
  ['afn1', 'aa-sl-functions', 'easy', 4, false, R`Find the coordinates of the vertex of the parabola $y = 2x^2 - 8x + 11$.`, null,
    [['M1', R`$x_v = -\frac{-8}{2(2)} = 2$`], ['A1', R`$x = 2$`], ['M1', R`$y = 2(4) - 8(2) + 11$`], ['A1', R`$y = 3$, vertex $(2, 3)$`]], R`$(2, 3)$`],

  // AA SL Trig
  ['atg1', 'aa-sl-trig', 'easy', 4, true, R`In triangle $ABC$, $AB = 6\text{ cm}$, $BC = 8\text{ cm}$ and $\angle ABC = 40^\circ$. Find the length of $AC$ to 3 significant figures.`, null,
    [['M1', R`$b^2 = 6^2 + 8^2 - 2(6)(8)\cos 40^\circ$`], ['A1', R`$b^2 = 36 + 64 - 96\cos 40^\circ = 26.46$`], ['M1', R`$b = \sqrt{26.46}$`], ['A1', R`$b = 5.14\text{ cm}$`]], R`$5.14\text{ cm}$`],

  // AA SL Calculus
  ['acl1', 'aa-sl-calculus', 'easy', 4, false, R`Find the equation of the tangent to the curve $y = x^3 - 4x + 1$ at the point where $x = 2$.`, null,
    [['M1', R`$\frac{dy}{dx} = 3x^2 - 4$`], ['A1', R`At $x=2$: $m = 3(4) - 4 = 8$`], ['M1', R`When $x=2$: $y = 8 - 8 + 1 = 1$`], ['A1', R`$y - 1 = 8(x - 2) \implies y = 8x - 15$`]], R`$y = 8x - 15$`],

  // Voronoi
  ['vo1', 'voronoi', 'easy', 3, true, R`Two sites are $A(2,\,1)$ and $B(6,\,5)$. Find the equation of the edge of the Voronoi diagram between the cells of $A$ and $B$.`, null,
    [['A1', R`Midpoint $(4,\,3)$`], ['M1', R`Gradient of $AB$ is $1$, so perpendicular gradient is $-1$`], ['A1', R`$y=-x+7$`]], R`$y=-x+7$`],
  ['vo2', 'voronoi', 'medium', 4, true, R`Three wells are at $A(0,\,0)$, $B(4,\,0)$ and $C(0,\,6)$, with distances in km.`,
    [['a', R`Find the coordinates of the vertex of the Voronoi diagram for these three sites.`, 3], ['b', R`Find the distance from this vertex to each well.`, 1]],
    [['M1', R`(a) Perpendicular bisector of $AB$: $x=2$`], ['M1', R`Perpendicular bisector of $AC$: $y=3$`], ['A1', R`$(2,\,3)$`], ['A1', R`(b) $\sqrt{2^2+3^2}=\sqrt{13}\approx3.61$ km`]],
    R`(a) $(2,\,3)$  (b) $3.61$ km`],

  // Normal distribution
  ['nd1', 'normal', 'easy', 2, true, R`$X\sim N(50,\,8^2)$. Find $P(42<X<58)$.`, null,
    [['M1', R`Recognises one standard deviation either side of the mean, or uses normal cdf`], ['A1', R`$0.683$`]], R`$0.683$`],
  ['nd2', 'normal', 'medium', 4, true, R`The heights of a group of students are normally distributed with mean 170 cm and standard deviation 6 cm.`,
    [['a', R`Find the probability that a student chosen at random is taller than 180 cm.`, 2], ['b', R`There are 500 students. Find the expected number who are taller than 180 cm.`, 2]],
    [['M1', R`(a) Normal cdf with lower bound 180, mean 170, sd 6`], ['A1', R`$0.0478$`], ['M1', R`(b) $500\times0.0478$`], ['A1', R`$23.9$, about 24 students`]], R`(a) $0.0478$  (b) about 24`],
  ['nd3', 'normal', 'hard', 3, true, R`$X\sim N(170,\,6^2)$. Find the value of $k$ such that $P(X<k)=0.9$.`, null,
    [['M1', R`Inverse normal with area $0.9$`], ['A1', R`$z=1.2816$`], ['A1', R`$k=177.7$`]], R`$k\approx177.7$`],

  // AI SL Chi-squared
  ['aic1', 'ai-sl-chi', 'easy', 4, true, R`A survey investigates gender and music preference. The contingency table has 2 rows and 3 columns. Calculate the degrees of freedom and state the null hypothesis.`, null,
    [['A1', R`$\nu = (2-1)(3-1) = 2$`], ['A1', R`$H_0$: Gender and music preference are independent`], ['M1', R`For significance level $\alpha = 0.05$ with $2$ df, critical value is $5.991$`], ['A1', R`Decision rule stated`]], R`$\nu = 2$`],

  // AI HL Matrices
  ['aimx1', 'ai-hl-matrices', 'easy', 4, true, R`Given the transition matrix $T = \begin{pmatrix} 0.8 & 0.1 \\ 0.2 & 0.9 \end{pmatrix}$, find the steady-state probability vector.`, null,
    [['M1', R`Sets $T\mathbf{s} = \mathbf{s}$ with $\mathbf{s} = \begin{pmatrix} x \\ y \end{pmatrix}$ and $x+y=1$`], ['A1', R`$0.8x + 0.1y = x \implies -0.2x + 0.1y = 0 \implies y = 2x$`], ['M1', R`$x + 2x = 1 \implies x = \frac13$`], ['A1', R`$\mathbf{s} = \begin{pmatrix} 1/3 \\ 2/3 \end{pmatrix}$`]], R`$\begin{pmatrix} 1/3 \\ 2/3 \end{pmatrix}$`],

  // AI HL Graphs
  ['aigt1', 'ai-hl-graphs', 'easy', 4, false, R`A connected planar graph has 6 vertices and 9 edges. Find the number of faces of the graph.`, null,
    [['M1', R`Applies Euler's formula $v - e + f = 2$`], ['A1', R`$6 - 9 + f = 2$`], ['M1', R`$-3 + f = 2$`], ['A1', R`$f = 5$`]], R`$f = 5$`],
];
