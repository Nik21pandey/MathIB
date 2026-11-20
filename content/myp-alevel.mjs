// IB MYP Mathematics (criteria A, B, D) and Cambridge A Level 9709 - original MathIB content.
const R = String.raw;

// Student-friendly achievement bands written for MathIB (not the IB's published descriptors).
const bandsB = [
  { band: '1-2', text: 'You apply a strategy you were given and state a pattern that matches some of the results.' },
  { band: '3-4', text: 'You choose a strategy, find a pattern and suggest a rule that matches your results.' },
  { band: '5-6', text: 'You describe the pattern as a general rule and verify it with a case you had not already used.' },
  { band: '7-8', text: 'You state a correct general rule, verify it, and justify or prove why it must always work.' },
];
const bandsD = [
  { band: '1-2', text: 'You pick out some relevant information and apply a strategy with limited success.' },
  { band: '3-4', text: 'You select a workable strategy, reach a solution and say whether it makes sense.' },
  { band: '5-6', text: 'You reach a valid solution, describe its degree of accuracy and whether it makes sense in the situation.' },
  { band: '7-8', text: 'You reach a correct solution and justify both its degree of accuracy and why it makes sense in the real situation.' },
];

export const syllabuses = [
  {
    slug: 'ib-myp-math', board: 'ib', code: 'MYP 4-5', name: 'IB MYP Mathematics', short: 'IB MYP', level: 'myp-ext', status: 'live',
    blurb: 'Practice built around the four branches and four assessment criteria. Criterion B investigations and Criterion D real-life tasks are interactive.',
    papers: [
      { name: 'eAssessment On-Screen (Standard)', calc: true, duration: '2 hours', marks: 100 },
      { name: 'eAssessment On-Screen (Extended)', calc: true, duration: '2 hours', marks: 100 },
    ],
    sections: [
      { slug: 'myp-numerical', name: 'Branch 1: Numerical and Abstract Reasoning', blurb: 'Number systems, indices, standard form, surds and error bounds.' },
      { slug: 'myp-models', name: 'Branch 2: Thinking with Models (Algebra & Functions)', blurb: 'Linear & quadratic models, functions, sequences and inequalities.' },
      { slug: 'myp-spatial', name: 'Branch 3: Spatial Reasoning (Geometry & Trig)', blurb: 'Polygons, circle theorems, 3D mensuration, Pythagoras and trigonometry.' },
      { slug: 'myp-data', name: 'Branch 4: Reasoning with Data (Stats & Probability)', blurb: 'Statistical analysis, correlation, sample space and probability trees.' },
      { slug: 'criterion-a', name: 'Criterion A: Knowing and Understanding', blurb: 'Topic tests with MYP command terms: state, describe, explain, justify.' },
      { slug: 'criterion-b', name: 'Criterion B: Investigating Patterns', hub: true, blurb: 'Pattern table, general rule prediction, verification and formal justification.' },
      { slug: 'criterion-d', name: 'Criterion D: Applying Mathematics in Real-Life Contexts', hub: true, blurb: 'Model real situations, solve, evaluate degree of accuracy and contextual sense.' },
    ],
  },
  {
    slug: 'a-level-9709', board: 'cambridge', code: '9709', name: 'Cambridge International AS & A Level Mathematics', short: 'A Level 9709', level: 'a-level', status: 'live',
    blurb: 'Complete AS & A Level curriculum: Pure Mathematics (P1, P3), Mechanics (M1) and Probability & Statistics (S1).',
    papers: [
      { name: 'Paper 1: Pure Mathematics 1 (P1)', calc: true, duration: '1 hour 50 minutes', marks: 75 },
      { name: 'Paper 3: Pure Mathematics 3 (P3)', calc: true, duration: '1 hour 50 minutes', marks: 75 },
      { name: 'Paper 4: Mechanics (M1)', calc: true, duration: '1 hour 15 minutes', marks: 50 },
      { name: 'Paper 5: Probability & Statistics 1 (S1)', calc: true, duration: '1 hour 15 minutes', marks: 50 },
    ],
    sections: [
      { slug: 'pure-mathematics-1', name: 'Paper 1: Pure Mathematics 1', blurb: 'Quadratics, circular measure, trigonometry, series, and differentiation.' },
      { slug: 'pure-mathematics-3', name: 'Paper 3: Pure Mathematics 3', blurb: 'Logarithms, advanced calculus, partial fractions, differential equations and complex numbers.' },
      { slug: 'mechanics-1', name: 'Paper 4: Mechanics', blurb: 'Forces and equilibrium, kinematics in a straight line, momentum and Newton\'s laws.' },
      { slug: 'probability-statistics-1', name: 'Paper 5: Probability & Statistics 1', blurb: 'Representation of data, permutations, combinations, and the normal distribution.' },
    ],
  },
  {
    slug: 'igcse-0606', board: 'cambridge', code: '0606', name: 'Cambridge IGCSE Additional Mathematics', short: 'IGCSE 0606', level: 'igcse-ext', status: 'live',
    blurb: 'Advanced mathematics preparing students for AS/A Level and IB DP. Rigorous algebra, trigonometry and calculus.',
    papers: [
      { name: 'Paper 1', calc: true, duration: '2 hours', marks: 80 },
      { name: 'Paper 2', calc: true, duration: '2 hours', marks: 80 },
    ],
    sections: [
      { slug: 'functions-quadratics', name: 'Functions and Quadratic Theory', blurb: 'Composite and inverse functions, discriminant and completed square form.' },
      { slug: 'indices-surds-logs', name: 'Indices, Surds and Logarithms', blurb: 'Rationalising surds, laws of logarithms and exponential equations.' },
      { slug: 'circular-measure', name: 'Circular Measure (Radians)', blurb: 'Radian measure, arc length, sector and segment area.' },
      { slug: 'trigonometry', name: 'Trigonometry: Identities and Equations', blurb: 'Secant, cosecant, cotangent and solving trigonometric equations.' },
      { slug: 'calculus-differentiation', name: 'Calculus: Differentiation and Rates', blurb: 'Product, quotient and chain rules, tangents and turning points.' },
      { slug: 'calculus-integration', name: 'Calculus: Integration and Area', blurb: 'Definite integrals, area under curves and kinematics.' },
    ],
  },
  {
    slug: 'igcse-0607', board: 'cambridge', code: '0607', name: 'Cambridge IGCSE International Mathematics', short: 'IGCSE 0607', level: 'igcse-ext', status: 'live',
    blurb: 'International curriculum with graphic display calculator (GDC) integration and mathematical investigations.',
    papers: [
      { name: 'Paper 2 (Core/Ext Non-Calc)', calc: false, duration: '45 minutes', marks: 40 },
      { name: 'Paper 4 (Extended Calc)', calc: true, duration: '2 hours 15 minutes', marks: 120 },
      { name: 'Paper 6 (Investigation & Modeling)', calc: true, duration: '1 hour 40 minutes', marks: 60 },
    ],
    sections: [
      { slug: 'number-algebra', name: 'Number and Algebra', blurb: 'Surds, financial calculations and sequences.' },
      { slug: 'functions-gdc', name: 'Functions and Graph Modeling (GDC)', blurb: 'GDC graphing, finding roots, asymptotes and modeling.' },
      { slug: 'geometry-trigonometry', name: 'Geometry and 3D Trigonometry', blurb: 'Circle theorems, 3D triangles, bearings and vectors.' },
      { slug: 'probability-statistics', name: 'Probability and Bivariate Statistics', blurb: 'Scatter graphs, correlation and lines of best fit on GDC.' },
      { slug: 'investigation-modeling', name: 'Paper 6: Investigation & Modeling', hub: true, blurb: 'Open-ended mathematical pattern deduction and model construction.' },
    ],
  },
];

export const topics = [
  {
    id: 'myp-algebra', syllabus: 'ib-myp-math', section: 'criterion-a', slug: 'algebra-expressions-and-equations', name: 'Algebra: Expressions and Equations',
    summary: 'Solve, expand and form equations, answering in the style the command term asks for.',
    generators: ['linear-eq', 'expand-double', 'percent-change'],
    notes: {
      points: [
        R`**State** or **write down**: give the answer only. No working is needed.`,
        R`**Describe**: say what happens, in order, using mathematical words.`,
        R`**Explain**: give the reason, linking a cause to its effect.`,
        R`**Justify**: give evidence or a proof that supports your answer.`,
        R`To solve a linear equation, undo the operations in reverse order, doing the same to both sides.`,
      ],
      formulas: [{ label: 'Expanding', tex: R`(x+a)(x+b)=x^2+(a+b)x+ab` }],
      gdc: [],
      traps: [
        R`Answering "justify" with only a number. Show the evidence.`,
        R`Subtracting a bracket: $-x(x-2)=-x^2+2x$. Both signs change.`,
      ],
    },
  },
  {
    id: 'myp-staircase', syllabus: 'ib-myp-math', section: 'criterion-b', slug: 'quadratic-sequences-investigation', name: 'Quadratic Sequences Investigation',
    tag: 'Interactive',
    summary: 'Investigate a staircase pattern, find a quadratic general rule and prove it.',
    generators: ['nth-term-quadratic'],
    notes: {
      points: [
        R`Work systematically: record results in a table before looking for a rule.`,
        R`Constant first differences mean a linear rule. Constant **second** differences mean a quadratic rule.`,
        R`If the second difference is $s$, the rule starts with $\tfrac{s}{2}n^2$.`,
        R`Verify with a stage you did **not** use to build the rule, then justify why the rule must hold for every stage.`,
      ],
      formulas: [{ label: 'Quadratic rule', tex: R`T_n=an^2+bn+c,\quad a=\dfrac{\text{second difference}}{2}` }],
      gdc: [],
      traps: [
        R`Verifying with a stage that was used to find the rule. That proves nothing new.`,
        R`Describing the pattern only in words and never writing the rule in algebra.`,
      ],
    },
    investigation: {
      title: 'The staircase',
      intro: R`A staircase is built from square blocks. Stage 1 uses 1 block. Each new stage adds a row that is one block longer than the row before, so stage 2 has rows of 1 and 2 blocks, stage 3 has rows of 1, 2 and 3 blocks, and so on.`,
      inputLabel: 'Stage, n', outputLabel: 'Blocks, T',
      given: [[1, 1], [2, 3], [3, 6]],
      blanks: [[4, 10], [5, 15], [6, 21]],
      predict: { n: 20, answer: 210 },
      steps: [
        { prompt: 'Describe in words how the pattern grows.', reveal: R`Each stage adds one more row, and that row is one block longer than the last: $+2,\ +3,\ +4,\ \ldots$` },
        { prompt: 'Find the first and second differences. What type of rule do they suggest?', reveal: R`First differences: $2, 3, 4, 5, 6$. Second differences: $1, 1, 1, 1$. A constant second difference of 1 means a quadratic rule starting with $\tfrac12n^2$.` },
        { prompt: 'Find a general rule for T in terms of n.', reveal: R`$T_n=\tfrac12n^2+\tfrac12n=\dfrac{n(n+1)}{2}$` },
        { prompt: 'Verify your rule using a stage you have not used yet.', reveal: R`Stage 7 by building: $21+7=28$. Rule: $\dfrac{7\times8}{2}=28$. They agree.` },
        { prompt: 'Justify why the rule works for every stage.', reveal: R`Two copies of the stage-$n$ staircase fit together into a rectangle $n$ blocks by $(n+1)$ blocks. That rectangle has $n(n+1)$ blocks, so one staircase has $\dfrac{n(n+1)}{2}$.` },
      ],
      bands: bandsB,
    },
  },
  {
    id: 'myp-matchsticks', syllabus: 'ib-myp-math', section: 'criterion-b', slug: 'matchstick-patterns-investigation', name: 'Matchstick Patterns Investigation',
    tag: 'Interactive',
    summary: 'Investigate a row of matchstick squares and justify a linear general rule.',
    generators: ['nth-term-linear'],
    notes: {
      points: [
        R`Build the first few stages and count carefully before predicting.`,
        R`A constant first difference $d$ gives a rule of the form $dn+c$.`,
        R`Link the rule back to the picture: what does the $d$ represent? What does the $c$ represent?`,
      ],
      formulas: [{ label: 'Linear rule', tex: R`M_n=dn+c` }],
      gdc: [],
      traps: [
        R`Counting shared matchsticks twice.`,
        R`Giving a rule such as "add 3 each time" without connecting it to $n$.`,
      ],
    },
    investigation: {
      title: 'Squares in a row',
      intro: R`Matchsticks are arranged to make a row of squares that share sides. One square needs 4 matchsticks, two squares need 7 and three squares need 10.`,
      inputLabel: 'Squares, n', outputLabel: 'Matchsticks, M',
      given: [[1, 4], [2, 7], [3, 10]],
      blanks: [[4, 13], [5, 16], [6, 19]],
      predict: { n: 50, answer: 151 },
      steps: [
        { prompt: 'Describe in words how the pattern grows.', reveal: R`Each new square shares one side with the row, so it needs only 3 more matchsticks.` },
        { prompt: 'Find a general rule for M in terms of n.', reveal: R`$M_n=3n+1$` },
        { prompt: 'Verify your rule using a stage you have not used yet.', reveal: R`Seven squares by building: $19+3=22$. Rule: $3(7)+1=22$. They agree.` },
        { prompt: 'Justify why the rule works for every stage.', reveal: R`The first square uses 4 matchsticks and each of the other $(n-1)$ squares uses 3, giving $4+3(n-1)=3n+1$. Equivalently: one starting matchstick, then 3 for every square.` },
      ],
      bands: bandsB,
    },
  },
  {
    id: 'myp-plans', syllabus: 'ib-myp-math', section: 'criterion-d', slug: 'linear-models-in-real-life', name: 'Linear Models in Real Life',
    summary: 'Build and compare models for real situations, then judge accuracy and whether the answer makes sense.',
    generators: ['percent-change', 'linear-eq'],
    notes: {
      points: [
        R`**Identify** the relevant information and define your variables with units.`,
        R`**Select** a strategy: an equation, a graph or a table of values.`,
        R`**Apply** it and reach a solution.`,
        R`**Accuracy**: say how exact your answer is and what rounding is sensible for the context.`,
        R`**Does it make sense?** Check the answer against the real situation and name a limitation of your model.`,
      ],
      formulas: [{ label: 'Linear model', tex: R`\text{cost}=\text{fixed charge}+\text{rate}\times\text{amount}` }],
      gdc: [],
      traps: [
        R`Stopping at the number. Criterion D rewards the comment on accuracy and sense.`,
        R`Rounding in the wrong direction: you cannot fill 6.28 days of water, only 6 whole days.`,
      ],
    },
    bands: bandsD,
  },
  {
    id: 'al-series', syllabus: 'a-level-9709', section: 'pure-mathematics-1', slug: 'arithmetic-and-geometric-progressions', name: 'Arithmetic and Geometric Progressions',
    summary: 'nth terms, sums, and sum to infinity.',
    generators: ['arithmetic-series', 'binomial-coefficient'],
    notes: {
      points: [
        R`Arithmetic: add a common difference $d$. Geometric: multiply by a common ratio $r$.`,
        R`A geometric progression has a sum to infinity only when $|r|<1$.`,
        R`Two unknowns need two equations. Divide geometric equations to eliminate $a$.`,
      ],
      formulas: [
        { label: 'AP nth term and sum', tex: R`u_n=a+(n-1)d,\qquad S_n=\tfrac{n}{2}\big(2a+(n-1)d\big)` },
        { label: 'GP nth term and sum', tex: R`u_n=ar^{\,n-1},\qquad S_n=\dfrac{a(1-r^n)}{1-r}` },
        { label: 'Sum to infinity', tex: R`S_\infty=\dfrac{a}{1-r},\quad |r|<1` },
      ],
      gdc: [],
      traps: [
        R`Using $n$ instead of $n-1$ in the nth-term formulas.`,
        R`Quoting a sum to infinity without checking $|r|<1$.`,
      ],
    },
  },
  {
    id: 'al-chain', syllabus: 'a-level-9709', section: 'pure-mathematics-1', slug: 'differentiation-chain-rule', name: 'Differentiation: the Chain Rule',
    summary: 'Differentiate composite functions and apply to gradients and stationary points.',
    generators: ['differentiate-poly', 'integrate-poly'],
    notes: {
      points: [
        R`Differentiate the outside, keep the inside, then multiply by the derivative of the inside.`,
        R`Rewrite roots and reciprocals as powers before differentiating.`,
        R`At a stationary point $\dfrac{dy}{dx}=0$. Use the second derivative to decide its nature.`,
      ],
      formulas: [
        { label: 'Chain rule', tex: R`\dfrac{dy}{dx}=\dfrac{dy}{du}\times\dfrac{du}{dx}` },
        { label: 'Power of a linear function', tex: R`\dfrac{d}{dx}(ax+b)^n=an(ax+b)^{n-1}` },
      ],
      gdc: [],
      traps: [
        R`Forgetting the factor from the inside: $\dfrac{d}{dx}(3x-2)^5$ is $15(3x-2)^4$, not $5(3x-2)^4$.`,
      ],
    },
  },
  // --- MYP Branches ---
  {
    id: 'myp-spatial-theorems', syllabus: 'ib-myp-math', section: 'myp-spatial', slug: 'spatial-reasoning-circle-theorems', name: 'Spatial Reasoning: Circle Theorems',
    summary: 'Analyze circle geometry, prove cyclic quadrilateral angle sums, and apply tangent rules.',
    generators: [],
    notes: {
      points: [
        R`Opposite angles in a cyclic quadrilateral sum to $180^\circ$.`,
        R`Angle at the circumference subtended by a diameter is always $90^\circ$.`,
      ],
      formulas: [],
      gdc: [],
      traps: [
        R`Forgetting to justify each step with the formal theorem name.`,
      ],
    },
  },

  // --- A Level 9709 Topics ---
  {
    id: 'al-p1-circular', syllabus: 'a-level-9709', section: 'pure-mathematics-1', slug: 'circular-measure-radians-arcs-sectors', name: 'Circular Measure: Radians, Arcs and Sectors',
    tag: 'P1 Core',
    summary: 'Radian measure, arc length s = r theta, and area of sector and segment.',
    generators: [],
    notes: {
      points: [
        R`Arc length: $s = r\theta$ with $\theta$ in radians.`,
        R`Sector area: $A = \frac{1}{2}r^2\theta$.`,
        R`Segment area: $A_{\text{segment}} = \frac{1}{2}r^2(\theta - \sin\theta)$.`,
      ],
      formulas: [
        { label: 'Arc length', tex: R`s = r\theta` },
        { label: 'Segment area', tex: R`A = \tfrac12 r^2(\theta - \sin\theta)` },
      ],
      gdc: [],
      traps: [
        R`Using degree formulas with radian angles.`,
      ],
    },
  },
  {
    id: 'al-p3-diff', syllabus: 'a-level-9709', section: 'pure-mathematics-3', slug: 'advanced-differentiation-product-quotient-implicit', name: 'Advanced Differentiation: Product, Quotient and Implicit',
    tag: 'P3 Core',
    summary: 'Differentiate exponential, logarithmic, trigonometric functions, and implicit curves.',
    generators: [],
    notes: {
      points: [
        R`$\frac{d}{dx}[\ln(f(x))] = \frac{f'(x)}{f(x)}$ and $\frac{d}{dx}[e^{f(x)}] = f'(x)e^{f(x)}$.`,
        R`Implicit differentiation: differentiate both sides with respect to $x$, applying chain rule to $y$ terms (e.g. $\frac{d}{dx}[y^2] = 2y\frac{dy}{dx}$).`,
      ],
      formulas: [
        { label: 'Log derivative', tex: R`\dfrac{d}{dx}[\ln x] = \dfrac{1}{x}` },
      ],
      gdc: [],
      traps: [
        R`Missing the product rule when differentiating mixed terms like $x^2 y$.`,
      ],
    },
  },
  {
    id: 'al-m1-kinematics', syllabus: 'a-level-9709', section: 'mechanics-1', slug: 'kinematics-motion-in-straight-line', name: 'Kinematics: Motion in a Straight Line',
    tag: 'M1 Core',
    summary: 'Constant acceleration formulae (SUVAT) and variable acceleration with calculus.',
    generators: [],
    notes: {
      points: [
        R`Velocity is the rate of change of displacement: $v = \frac{ds}{dt}$.`,
        R`Acceleration is the rate of change of velocity: $a = \frac{dv}{dt} = \frac{d^2s}{dt^2}$.`,
        R`Displacement is the integral of velocity: $s = \int v\,dt$.`,
      ],
      formulas: [
        { label: 'Velocity', tex: R`v = \dfrac{ds}{dt}` },
        { label: 'Acceleration', tex: R`a = \dfrac{dv}{dt}` },
      ],
      gdc: [],
      traps: [
        R`Using constant acceleration formulae (SUVAT) when acceleration varies with time.`,
      ],
    },
  },
  {
    id: 'al-s1-permutations', syllabus: 'a-level-9709', section: 'probability-statistics-1', slug: 'permutations-and-combinations', name: 'Permutations and Combinations',
    tag: 'S1 Core',
    summary: 'Arrangements in a line, circular permutations, restrictions, and selections with nCr.',
    generators: [],
    notes: {
      points: [
        R`Permutations (order matters): $^n P_r = \frac{n!}{(n-r)!}$.`,
        R`Combinations (order does not matter): $\binom{n}{r} = \frac{n!}{r!(n-r)!}$.`,
        R`Items together: bundle them as one item, multiply by internal arrangements.`,
      ],
      formulas: [
        { label: 'Combinations', tex: R`\binom{n}{r} = \dfrac{n!}{r!(n-r)!}` },
      ],
      gdc: [],
      traps: [
        R`Using permutations when the group order does not matter (e.g. choosing a committee).`,
      ],
    },
  },

  // --- IGCSE 0606 Topics ---
  {
    id: 'add-indices-logs', syllabus: 'igcse-0606', section: 'indices-surds-logs', slug: 'logarithmic-equations-and-laws', name: 'Logarithmic Equations and Laws of Logarithms',
    tag: '0606 Core',
    summary: 'Solve equations using laws of logarithms, change of base, and natural logarithms.',
    generators: ['log-evaluate'],
    notes: {
      points: [
        R`$\log_a(xy) = \log_a x + \log_a y$ and $\log_a\left(\frac{x}{y}\right) = \log_a x - \log_a y$.`,
        R`Power rule: $\log_a(x^k) = k\log_a x$.`,
        R`Change of base: $\log_a b = \frac{\log_c b}{\log_c a}$.`,
      ],
      formulas: [
        { label: 'Change of base', tex: R`\log_a b = \dfrac{\ln b}{\ln a}` },
      ],
      gdc: [],
      traps: [
        R`Writing $\log(x+y) = \log x + \log y$, which is completely false.`,
      ],
    },
  },
  {
    id: 'add-diff', syllabus: 'igcse-0606', section: 'calculus-differentiation', slug: 'chain-rule-product-and-quotient-rules', name: 'Chain Rule, Product and Quotient Rules',
    tag: '0606 Core',
    summary: 'Differentiate composite functions, products and quotients, and apply to tangents.',
    generators: ['differentiate-poly'],
    notes: {
      points: [
        R`Chain rule: $\frac{dy}{dx} = \frac{dy}{du} \times \frac{du}{dx}$.`,
        R`Product rule: $\frac{d}{dx}(uv) = u\frac{dv}{dx} + v\frac{du}{dx}$.`,
        R`Quotient rule: $\frac{d}{dx}\left(\frac{u}{v}\right) = \frac{v\frac{du}{dx} - u\frac{dv}{dx}}{v^2}$.`,
      ],
      formulas: [
        { label: 'Chain rule', tex: R`\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}` },
      ],
      gdc: [],
      traps: [
        R`Subtracting in reverse order in the quotient rule numerator.`,
      ],
    },
  },

  // --- IGCSE 0607 Topics ---
  {
    id: 'cam-0607-gdc-functions', syllabus: 'igcse-0607', section: 'functions-gdc', slug: 'gdc-graphing-roots-and-extrema', name: 'GDC Graphing, Roots and Local Extrema',
    tag: '0607 Core',
    summary: 'Sketch graphs, locate zeros, local maxima/minima, and vertical/horizontal asymptotes using GDC.',
    generators: [],
    notes: {
      points: [
        R`Ensure viewing window encompasses all key features (intercepts, turning points, asymptotes).`,
        R`Use GDC solver to find coordinates of intersection between two curves.`,
      ],
      formulas: [],
      gdc: [
        R`TI-Nspire: menu, Analyze Graph, Zero / Minimum / Maximum / Intersection.`,
      ],
      traps: [
        R`Rounding intermediate coordinates: keep 3 significant figures for the final answer.`,
      ],
    },
  },
  {
    id: 'cam-0607-stats', syllabus: 'igcse-0607', section: 'probability-statistics', slug: 'bivariate-statistics-and-regression-on-gdc', name: 'Bivariate Statistics and Linear Regression on GDC',
    tag: '0607 Core',
    summary: 'Scatter diagrams, correlation, equation of regression line, and mean point on GDC.',
    generators: [],
    notes: {
      points: [
        R`The regression line passes through the mean point $(\bar{x}, \bar{y})$.`,
        R`Use regression line only for estimating within the range of observed $x$ values (interpolation).`,
      ],
      formulas: [],
      gdc: [
        R`TI-Nspire: Lists & Spreadsheet, menu, Statistics, Stat Calculations, Linear Regression (mx+b).`,
      ],
      traps: [
        R`Swapping the X List and Y List when calculating regression parameters.`,
      ],
    },
  },
];

export const questions = [
  ['ma1', 'myp-algebra', 'easy', 2, false, R`Solve $3x-7=11$.`, null,
    [['M1', R`$3x=18$`], ['A1', R`$x=6$`]], R`$x=6$`, { criterion: 'A' }],
  ['ma2', 'myp-algebra', 'medium', 3, false, R`Expand and simplify $(x+4)(x-3)-x(x-2)$.`, null,
    [['M1', R`$x^2+x-12$`], ['M1', R`$-x^2+2x$`], ['A1', R`$3x-12$`]], R`$3x-12$`, { criterion: 'A' }],
  ['ma3', 'myp-algebra', 'hard', 4, false, R`The sum of three consecutive even numbers is $150$. Write down an equation and use it to find the three numbers. Justify that your answer is correct.`, null,
    [['M1', R`$n+(n+2)+(n+4)=150$`], ['M1', R`$3n+6=150$`], ['A1', R`$48,\ 50,\ 52$`], ['R1', R`Justification: all three are even, consecutive, and $48+50+52=150$`]], R`$48,\ 50,\ 52$`, { criterion: 'A' }],

  ['mb1', 'myp-staircase', 'medium', 6, false, R`A sequence begins $2,\ 6,\ 12,\ 20,\ 30,\ \ldots$`,
    [['a', R`Describe the pattern in the differences.`, 1], ['b', R`Find a general rule for the nth term.`, 2], ['c', R`Verify your rule for $n=6$.`, 1], ['d', R`Justify your rule by linking it to rectangles of dots.`, 2]],
    [['A1', R`(a) First differences $4, 6, 8, 10$; second difference is constant at $2$`], ['M1', R`(b) $n^2$ plus a linear part`], ['A1', R`$n^2+n$ or $n(n+1)$`], ['A1', R`(c) Next term by differences $30+12=42$; rule gives $6\times7=42$`], ['R2', R`(d) Term $n$ can be drawn as a rectangle $n$ dots by $(n+1)$ dots, which contains $n(n+1)$ dots`]],
    R`$n(n+1)$`, { criterion: 'B' }],
  ['mb2', 'myp-staircase', 'hard', 6, false, R`A sequence begins $4,\ 9,\ 16,\ 25,\ \ldots$ Find a general rule, verify it, and predict the 30th term.`, null,
    [['M1', R`Recognises square numbers, shifted by one`], ['A2', R`$(n+1)^2$`], ['A1', R`Verify: $n=5$ gives $36$, and by differences $25+11=36$`], ['M1', R`$31^2$`], ['A1', R`$961$`]],
    R`$(n+1)^2$; the 30th term is $961$`, { criterion: 'B' }],
  ['mb3', 'myp-matchsticks', 'medium', 6, false, R`Matchsticks are arranged to make a row of hexagons that share sides. One hexagon needs 6 matchsticks and two hexagons need 11.`,
    [['a', R`Find a general rule for the number of matchsticks in a row of $n$ hexagons.`, 2], ['b', R`Find the number of matchsticks needed for 12 hexagons.`, 1], ['c', R`A row uses 151 matchsticks. Find the number of hexagons.`, 2], ['d', R`Justify your rule.`, 1]],
    [['M1', R`(a) Each new hexagon adds 5`], ['A1', R`$5n+1$`], ['A1', R`(b) $61$`], ['M1', R`(c) $5n+1=151$`], ['A1', R`$n=30$`], ['R1', R`(d) One starting matchstick, then 5 more for every hexagon`]],
    R`(a) $5n+1$  (b) $61$  (c) $30$`, { criterion: 'B' }],

  ['md1', 'myp-plans', 'medium', 8, true, R`Two mobile data plans are available. Plan A costs \$10 per month plus \$2 for each GB used. Plan B costs \$25 per month plus \$0.50 for each GB used.`,
    [['a', R`Write a model for the monthly cost of each plan when $g$ GB are used.`, 2], ['b', R`Find the usage for which both plans cost the same, and that cost.`, 3], ['c', R`Mia uses about 14 GB each month. Recommend a plan and justify your choice.`, 2], ['d', R`Describe one reason why your recommendation might not hold in practice.`, 1]],
    [['A1', R`(a) $A=10+2g$`], ['A1', R`$B=25+0.5g$`], ['M1', R`(b) $10+2g=25+0.5g$`], ['A1', R`$g=10$ GB`], ['A1', R`Both cost \$30`], ['M1', R`(c) $A=10+2(14)=38$ and $B=25+0.5(14)=32$`], ['R1', R`Plan B, because it is \$6 cheaper at 14 GB, and cheaper for any usage above 10 GB`], ['R1', R`(d) For example: usage changes from month to month, or data may be charged in whole GB`]],
    R`Equal at 10 GB (\$30). Plan B for 14 GB.`, { criterion: 'D' }],
  ['md2', 'myp-plans', 'hard', 6, true, R`A cylindrical water tank has radius 0.5 m and height 1.2 m. A family uses 150 litres of water per day. ($1\ \text{m}^3=1000$ litres.)`,
    [['a', R`Find the volume of the tank in litres.`, 2], ['b', R`Find the number of whole days a full tank will last.`, 2], ['c', R`Justify the degree of accuracy of your answer to part (b).`, 2]],
    [['M1', R`(a) $\pi\times0.5^2\times1.2=0.9425\ \text{m}^3$`], ['A1', R`$942$ litres (3 s.f.)`], ['M1', R`(b) $942\div150=6.28$`], ['A1', R`$6$ days`], ['R2', R`(c) Rounded down because the water runs out during the 7th day. Daily use of 150 litres is itself an estimate, so more decimal places would not be meaningful`]],
    R`(a) $942$ litres  (b) $6$ days`, { criterion: 'D' }],

  ['ap1', 'al-series', 'easy', 4, true, R`An arithmetic progression has first term $5$ and common difference $3$. Find the 20th term and the sum of the first 20 terms.`, null,
    [['M1', R`$5+19\times3$`], ['A1', R`$62$`], ['M1', R`$\tfrac{20}{2}(5+62)$`], ['A1', R`$670$`]], R`$u_{20}=62,\ S_{20}=670$`],
  ['ap2', 'al-series', 'medium', 4, true, R`A geometric progression has first term $12$ and common ratio $\tfrac12$. Find the 6th term and the sum to infinity.`, null,
    [['M1', R`$12\times\left(\tfrac12\right)^5$`], ['A1', R`$\tfrac38$`], ['M1', R`$\dfrac{12}{1-\frac12}$`], ['A1', R`$24$`]], R`$u_6=\tfrac38,\ S_\infty=24$`],
  ['ap3', 'al-series', 'hard', 6, true, R`A geometric progression has second term $6$ and sum to infinity $25$. Find the two possible values of the common ratio and the corresponding first terms.`, null,
    [['B1', R`$ar=6$ and $\dfrac{a}{1-r}=25$`], ['M1', R`Eliminates $a$: $\dfrac{6}{r(1-r)}=25$`], ['A1', R`$25r^2-25r+6=0$`], ['M1', R`$(5r-2)(5r-3)=0$`], ['A1', R`$r=\tfrac25$ or $r=\tfrac35$`], ['A1', R`$a=15$ or $a=10$`]],
    R`$r=\tfrac25,\ a=15$ or $r=\tfrac35,\ a=10$`],

  ['al1', 'al-chain', 'easy', 3, true, R`Differentiate $y=(3x-2)^5$ with respect to $x$.`, null,
    [['M1', R`$5(3x-2)^4$`], ['M1', R`Multiplies by $3$`], ['A1', R`$15(3x-2)^4$`]], R`$15(3x-2)^4$`],
  ['al2', 'al-chain', 'medium', 4, true, R`Find the gradient of the curve $y=\sqrt{4x+1}$ at the point where $x=2$.`, null,
    [['M1', R`$y=(4x+1)^{\frac12}$`], ['M1', R`$\dfrac{dy}{dx}=\tfrac12(4x+1)^{-\frac12}\times4$`], ['A1', R`$\dfrac{2}{\sqrt{4x+1}}$`], ['A1', R`$\dfrac23$`]], R`$\dfrac23$`],
  ['al3', 'al-chain', 'hard', 6, true, R`A curve has equation $y=(2x-3)^3-6x$. Find the coordinates of the stationary points and determine the nature of each.`, null,
    [['M1', R`$\dfrac{dy}{dx}=6(2x-3)^2-6$`], ['M1', R`$(2x-3)^2=1$`], ['A1', R`$x=2$ or $x=1$`], ['A1', R`$(2,\,-11)$ and $(1,\,-7)$`], ['M1', R`$\dfrac{d^2y}{dx^2}=24(2x-3)$`], ['A1', R`$(2,\,-11)$ minimum, $(1,\,-7)$ maximum`]],
    R`Minimum at $(2,\,-11)$, maximum at $(1,\,-7)$`],
  // MYP Spatial
  ['myps1', 'myp-spatial-theorems', 'easy', 3, false, R`In a cyclic quadrilateral $ABCD$, angle $\angle ABC = 75^\circ$. Find angle $\angle ADC$ and state the geometrical property.`, null,
    [['M1', R`Opposite angles sum to $180^\circ$`], ['A1', R`$\angle ADC = 180^\circ - 75^\circ = 105^\circ$`], ['R1', R`Opposite angles of a cyclic quadrilateral are supplementary`]], R`$105^\circ$`],

  // A Level P1 Circular Measure
  ['alp1', 'al-p1-circular', 'easy', 4, false, R`A circle has radius $6\text{ cm}$. A sector has angle $\theta = \frac{2\pi}{3}\text{ radians}$. Find the perimeter and area of the sector in terms of $\pi$.`, null,
    [['M1', R`Arc length $s = 6 \times \frac{2\pi}{3} = 4\pi$`], ['A1', R`Perimeter $= 6 + 6 + 4\pi = 12 + 4\pi\text{ cm}$`], ['M1', R`Area $= \frac{1}{2}(6^2)\left(\frac{2\pi}{3}\right)$`], ['A1', R`Area $= 12\pi\text{ cm}^2$`]], R`$P = 12+4\pi\text{ cm},\ A = 12\pi\text{ cm}^2$`],

  // A Level P3 Differentiation
  ['alp3', 'al-p3-diff', 'easy', 4, false, R`Find $\dfrac{dy}{dx}$ for $y = x^2 e^{3x}$.`, null,
    [['M1', R`Applies product rule: $u = x^2, v = e^{3x}$`], ['A1', R`$u' = 2x, v' = 3e^{3x}$`], ['M1', R`$\frac{dy}{dx} = 2x e^{3x} + 3x^2 e^{3x}$`], ['A1', R`$= x e^{3x}(2 + 3x)$`]], R`$x e^{3x}(2 + 3x)$`],

  // A Level M1 Kinematics
  ['alm1', 'al-m1-kinematics', 'easy', 3, false, R`A particle moves in a straight line so that its displacement at time $t$ is $s = 2t^3 - 9t^2 + 12t$. Find the times at which the particle is momentarily at rest.`, null,
    [['M1', R`$v = \frac{ds}{dt} = 6t^2 - 18t + 12$`], ['M1', R`Sets $6(t^2 - 3t + 2) = 0 \implies 6(t-1)(t-2) = 0$`], ['A1', R`$t = 1\text{ s},\ t = 2\text{ s}$`]], R`$t = 1\text{ s},\ t = 2\text{ s}$`],

  // A Level S1 Permutations
  ['als1', 'al-s1-permutations', 'easy', 3, false, R`In how many ways can 5 books be arranged in a line on a shelf?`, null,
    [['M1', R`Calculates $5!$`], ['A1', R`$5 \times 4 \times 3 \times 2 \times 1$`], ['A1', R`$120$`]], R`$120$`],

  // 0606 Logs
  ['add1', 'add-indices-logs', 'easy', 3, false, R`Solve $\log_2(x+3) + \log_2(x-3) = 4$.`, null,
    [['M1', R`$\log_2[(x+3)(x-3)] = 4 \implies x^2 - 9 = 2^4$`], ['A1', R`$x^2 - 9 = 16 \implies x^2 = 25$`], ['A1', R`$x = 5$ (rejects $x = -5$ since $\log_2$ requires positive argument)`]], R`$x = 5$`],

  // 0606 Differentiation
  ['add2', 'add-diff', 'easy', 4, false, R`Differentiate $y = (2x - 5)^4$ with respect to $x$.`, null,
    [['M1', R`Applies chain rule: $4(2x-5)^3 \times \frac{d}{dx}(2x-5)$`], ['A1', R`$\frac{d}{dx}(2x-5) = 2$`], ['M1', R`Multiplies coefficients`], ['A1', R`$8(2x-5)^3$`]], R`$8(2x-5)^3$`],

  // 0607 Functions
  ['cam1', 'cam-0607-gdc-functions', 'easy', 3, true, R`Use a graphic display calculator to find the zeros of $f(x) = x^3 - 3x^2 - x + 3$.`, null,
    [['M1', R`Graphs function on GDC and inspects roots`], ['A1', R`$x = -1,\ x = 1$`], ['A1', R`$x = 3$`]], R`$x = -1,\ 1,\ 3$`],

  // 0607 Stats
  ['cam2', 'cam-0607-stats', 'easy', 3, true, R`A dataset has mean values $\bar{x} = 10$ and $\bar{y} = 25$. The regression line of $y$ on $x$ has gradient $1.8$. Find the equation of the regression line.`, null,
    [['M1', R`Line passes through $(10, 25)$: $y - 25 = 1.8(x - 10)$`], ['A1', R`$y = 1.8x - 18 + 25$`], ['A1', R`$y = 1.8x + 7$`]], R`$y = 1.8x + 7$`],
];

export const checklists = [
  {
    slug: 'igcse-0580-paper-2', syllabus: 'igcse-0580', paper: 'Paper 2 (non-calculator)',
    title: '60-minute night-before checklist: IGCSE 0580 Paper 2',
    items: [
      { text: R`Recite the exact values of sin, cos and tan for $0^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ$ from memory.`, topic: 'exact-trig', minutes: 5 },
      { text: R`Simplify three surds and rationalise one denominator with a conjugate.`, topic: 'surds', minutes: 8 },
      { text: R`Evaluate one negative and one fractional index by hand: root first, then power.`, topic: 'indices', minutes: 5 },
      { text: R`Do one standard-form division and re-adjust the answer to $1\le A<10$.`, topic: 'indices', minutes: 4 },
      { text: R`Factorise one quadratic and solve one with the formula, leaving a simplified surd.`, topic: 'quadratics', minutes: 8 },
      { text: R`Find one linear and one quadratic nth term.`, topic: 'sequences', minutes: 6 },
      { text: R`State the range of a quadratic on a restricted domain. Check the vertex.`, topic: 'domain-range', minutes: 5 },
      { text: R`Differentiate a cubic and find its turning points.`, topic: 'differentiation', minutes: 7 },
      { text: 'Practise one long multiplication and one fraction division on paper. No calculator means arithmetic slips cost marks.', minutes: 6 },
      { text: 'Read the formula sheet once so you know what is given and what is not (exact trig values are not).', minutes: 3 },
      { text: 'Pack: pens, pencil, ruler, protractor, compasses. Leave the calculator out of this paper.', minutes: 3 },
    ],
  },
  {
    slug: 'ibdp-math-aa-hl-paper-1', syllabus: 'ibdp-math-aa-hl', paper: 'Paper 1 (no calculator)',
    title: '60-minute night-before checklist: IB Math AA HL Paper 1',
    items: [
      { text: R`Write the general term of $(a+b)^n$ and find one term independent of $x$.`, topic: 'binomial', minutes: 8 },
      { text: 'Convert one complex number to polar form. Sketch it first to get the quadrant right.', topic: 'complex', minutes: 6 },
      { text: R`Solve one equation of the form $z^3=w$ and list all three roots.`, topic: 'complex', minutes: 8 },
      { text: R`Write out the Maclaurin series for $e^x$, $\sin x$, $\cos x$ and $\ln(1+x)$ and find where they are in the booklet.`, topic: 'maclaurin', minutes: 6 },
      { text: 'Evaluate one limit using series.', topic: 'maclaurin', minutes: 6 },
      { text: 'Differentiate one product, one quotient and one composite function.', minutes: 8 },
      { text: 'Do one integration by substitution and one by parts.', minutes: 8 },
      { text: 'Skim the formula booklet section headings so you can find things quickly.', minutes: 5 },
      { text: 'Plan your timing: about one minute per mark, and move on if a part is stuck.', minutes: 5 },
    ],
  },
];
