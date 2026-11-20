// Pearson Edexcel Mathematics (International GCSE 4MA1 and GCSE 1MA1) - original MathIB content.
const R = String.raw;

export const syllabuses = [
  {
    slug: 'edexcel-igcse-4ma1', board: 'edexcel', code: '4MA1', name: 'Pearson Edexcel International GCSE (9-1) Mathematics A',
    short: 'Edexcel IGCSE 4MA1', level: 'edexcel-igcse', status: 'live',
    blurb: 'Higher Tier 4MA1 specification. Two 2-hour calculator papers covering numbers, algebra, geometry, vectors, calculus and statistics.',
    papers: [
      { name: 'Paper 1H (Higher Tier)', calc: true, duration: '2 hours', marks: 100 },
      { name: 'Paper 2H (Higher Tier)', calc: true, duration: '2 hours', marks: 100 },
    ],
    sections: [
      { slug: 'numbers', name: 'Strand 1: Numbers and the Number System', blurb: 'Recurring decimals to fractions, surds, indices, standard form and bounds.' },
      { slug: 'algebra', name: 'Strand 2: Equations, Formulae and Functions', blurb: 'Algebraic manipulation, simultaneous equations, composite and inverse functions.' },
      { slug: 'geometry-trig', name: 'Strand 3: Geometry and Trigonometry', blurb: 'Circle theorems, 3D trigonometry, bearings, sine and cosine rules.' },
      { slug: 'vectors-transforms', name: 'Strand 4: Vectors and Transformation Geometry', blurb: 'Column vectors, geometric proofs and transformations.' },
      { slug: 'stats-probability', name: 'Strand 5: Statistics and Probability', blurb: 'Histograms with frequency density, cumulative frequency and conditional probability.' },
      { slug: 'calculus', name: 'Strand 6: Calculus Extension', blurb: 'Differentiation, kinematic velocity-time modeling and turning points.' },
    ],
  },
  {
    slug: 'edexcel-gcse-1ma1', board: 'edexcel', code: '1MA1', name: 'Pearson Edexcel GCSE (9-1) Mathematics',
    short: 'Edexcel GCSE 1MA1', level: 'gcse-higher', status: 'live',
    blurb: 'UK National Curriculum Higher Tier. Paper 1 (Non-Calculator) and Papers 2 & 3 (Calculator). Targeting Grades 9 to 4.',
    papers: [
      { name: 'Paper 1 (Non-Calculator)', calc: false, duration: '1 hour 30 minutes', marks: 80 },
      { name: 'Paper 2 (Calculator)', calc: true, duration: '1 hour 30 minutes', marks: 80 },
      { name: 'Paper 3 (Calculator)', calc: true, duration: '1 hour 30 minutes', marks: 80 },
    ],
    sections: [
      { slug: 'number', name: 'Topic 1: Number and Ratio', blurb: 'Fractions, recurring decimals, standard form, ratio and compound measures.' },
      { slug: 'algebra', name: 'Topic 2: Algebra and Sequences', blurb: 'Factorising quadratics, simultaneous equations, iteration, linear and quadratic nth terms.' },
      { slug: 'geometry', name: 'Topic 3: Geometry and Measures', blurb: 'Pythagoras, SOHCAHTOA, perimeter, area, volume and circle theorems.' },
      { slug: 'stats-prob', name: 'Topic 4: Probability and Statistics', blurb: 'Venn diagrams, tree diagrams, averages, histograms and box plots.' },
    ],
  },
];

export const topics = [
  // --- Edexcel IGCSE 4MA1 Topics ---
  {
    id: 'edx-recurring-decimals', syllabus: 'edexcel-igcse-4ma1', section: 'numbers', slug: 'recurring-decimals-to-fractions', name: 'Recurring Decimals to Fractions',
    summary: 'Convert recurring decimals into simplified fractions using algebraic multiplication.',
    generators: [],
    notes: {
      points: [
        R`Let $x = 0.\dot{a}\dot{b}$. Multiply by $10^n$ where $n$ is the number of recurring digits.`,
        R`Subtract the original equation to cancel the repeating decimal tails: $100x - x = 99x$.`,
        R`Simplify the resulting fraction to lowest terms.`,
      ],
      formulas: [],
      gdc: [],
      traps: [
        R`For numbers with non-recurring prefix like $0.2\dot{3}\dot{5}$, multiply by 10 first to align the recurring pattern.`,
      ],
    },
  },
  {
    id: 'edx-functions-composite', syllabus: 'edexcel-igcse-4ma1', section: 'algebra', slug: 'composite-and-inverse-functions', name: 'Composite and Inverse Functions',
    summary: 'Evaluate composite functions fg(x), find algebraic inverse functions f^{-1}(x), and identify domains.',
    generators: [],
    notes: {
      points: [
        R`Composite $fg(x)$ means substitute $g(x)$ into $f(x)$ everywhere $x$ appears: work from right to left.`,
        R`To find inverse $f^{-1}(x)$: set $y = f(x)$, rearrange to make $x$ the subject, and replace $x$ with $y$.`,
      ],
      formulas: [
        { label: 'Inverse identity', tex: R`f(f^{-1}(x)) = x` },
      ],
      gdc: [],
      traps: [
        R`Evaluating $fg(2)$ by doing $f(2)$ first instead of $g(2)$. Always evaluate inside out.`,
      ],
    },
  },
  {
    id: 'edx-histograms', syllabus: 'edexcel-igcse-4ma1', section: 'stats-probability', slug: 'histograms-and-frequency-density', name: 'Histograms and Frequency Density',
    summary: 'Construct and interpret histograms with unequal class widths using frequency density.',
    generators: [],
    notes: {
      points: [
        R`In a histogram, **area** represents frequency: $\text{Frequency} = \text{Frequency Density} \times \text{Class Width}$.`,
        R`Frequency Density = $\dfrac{\text{Frequency}}{\text{Class Width}}$. The vertical axis is always Frequency Density.`,
      ],
      formulas: [
        { label: 'Frequency density', tex: R`\text{FD} = \dfrac{\text{Frequency}}{\text{Class Width}}` },
      ],
      gdc: [],
      traps: [
        R`Plotting frequency directly on the vertical axis when class widths are unequal.`,
      ],
    },
  },
  {
    id: 'edx-differentiation', syllabus: 'edexcel-igcse-4ma1', section: 'calculus', slug: 'differentiation-and-kinematics', name: 'Differentiation and Kinematics',
    summary: 'Differentiate polynomials, find stationary points, and solve velocity/acceleration problems.',
    generators: ['differentiate-poly'],
    notes: {
      points: [
        R`If $y = a x^n$, then $\frac{dy}{dx} = n a x^{n-1}$.`,
        R`Turning points occur where $\frac{dy}{dx} = 0$.`,
        R`Kinematics: Velocity $v = \frac{ds}{dt}$, Acceleration $a = \frac{dv}{dt}$.`,
      ],
      formulas: [
        { label: 'Power rule', tex: R`\dfrac{d}{dx}[x^n] = n x^{n-1}` },
      ],
      gdc: [],
      traps: [
        R`Differentiating a constant to give 1 instead of 0.`,
      ],
    },
  },

  // --- Edexcel GCSE 1MA1 Topics ---
  {
    id: 'gcse-quadratics-factorising', syllabus: 'edexcel-gcse-1ma1', section: 'algebra', slug: 'factorising-harder-quadratics', name: 'Factorising Harder Quadratics',
    summary: 'Factorise quadratics with coefficient of x^2 greater than 1, and difference of two squares.',
    generators: [],
    notes: {
      points: [
        R`To factorise $ax^2 + bx + c$: find two numbers that multiply to $ac$ and add to $b$.`,
        R`Split the middle term $bx$ and factorise by grouping into two brackets.`,
        R`Difference of two squares: $a^2 - b^2 = (a-b)(a+b)$.`,
      ],
      formulas: [
        { label: 'DOTS', tex: R`a^2 - b^2 = (a-b)(a+b)` },
      ],
      gdc: [],
      traps: [
        R`Forgetting that $(2x-3)^2$ produces a middle term $-12x$, not just $4x^2 + 9$.`,
      ],
    },
  },
  {
    id: 'gcse-trig-pythagoras', syllabus: 'edexcel-gcse-1ma1', section: 'geometry', slug: 'trigonometry-and-pythagoras-in-3d', name: 'Trigonometry and Pythagoras in 3D',
    summary: 'Calculate lengths and angles in 3D cuboids, prisms and pyramids.',
    generators: [],
    notes: {
      points: [
        R`3D Pythagoras for cuboid of dimensions $a, b, c$: diagonal $d = \sqrt{a^2 + b^2 + c^2}$.`,
        R`To find the angle between a line and a plane, drop a perpendicular from the tip to the plane and identify the right-angled triangle.`,
      ],
      formulas: [
        { label: '3D Pythagoras', tex: R`d = \sqrt{x^2+y^2+z^2}` },
      ],
      gdc: [],
      traps: [
        R`Projecting the diagonal to the wrong edge of the base rather than the base diagonal.`,
      ],
    },
  },
  {
    id: 'gcse-conditional-prob', syllabus: 'edexcel-gcse-1ma1', section: 'stats-prob', slug: 'conditional-probability-without-replacement', name: 'Conditional Probability Without Replacement',
    summary: 'Solve multi-stage probability problems where the sample space changes after each trial.',
    generators: [],
    notes: {
      points: [
        R`Without replacement: numerator and denominator decrease by 1 for identical item selection.`,
        R`"At least one" problems: $P(\text{at least one red}) = 1 - P(\text{no red})$.`,
      ],
      formulas: [],
      gdc: [],
      traps: [
        R`Keeping the denominator constant across trials when items are not replaced.`,
      ],
    },
  },
];

export const questions = [
  // 4MA1 Recurring Decimals
  ['edx1', 'edx-recurring-decimals', 'easy', 3, false, R`Show that the recurring decimal $0.\dot{4}\dot{7}$ can be written as the fraction $\dfrac{47}{99}$.`, null,
    [['M1', R`Let $x = 0.474747\ldots$, so $100x = 47.474747\ldots$`], ['M1', R`Subtracts: $100x - x = 99x = 47$`], ['A1', R`$x = \dfrac{47}{99}$`]], R`$\dfrac{47}{99}$`],

  // 4MA1 Functions
  ['edx2', 'edx-functions-composite', 'medium', 4, true, R`The functions $f$ and $g$ are defined as $f(x) = 3x - 5$ and $g(x) = x^2 + 2$.`,
    [['a', R`Find $fg(3)$.`, 2], ['b', R`Find an expression for $f^{-1}(x)$.`, 2]],
    [['M1', R`(a) $g(3) = 3^2 + 2 = 11$`], ['A1', R`$f(11) = 3(11) - 5 = 28$`], ['M1', R`(b) $y = 3x - 5 \implies x = \frac{y+5}{3}$`], ['A1', R`$f^{-1}(x) = \dfrac{x+5}{3}$`]],
    R`(a) $28$  (b) $\dfrac{x+5}{3}$`],

  // 4MA1 Histograms
  ['edx3', 'edx-histograms', 'easy', 3, true, R`In a histogram, the class interval $20 \le w < 30$ has frequency 35. Calculate the frequency density for this bar.`, null,
    [['M1', R`Class width $= 30 - 20 = 10$`], ['M1', R`$\text{Frequency Density} = \dfrac{35}{10}$`], ['A1', R`$\text{FD} = 3.5$`]], R`$3.5$`],

  // 4MA1 Calculus
  ['edx4', 'edx-differentiation', 'easy', 3, false, R`A curve has equation $y = 2x^3 - 9x^2 + 12x + 4$. Find $\dfrac{dy}{dx}$ and find the coordinates of the stationary points.`,
    [['a', R`Find $\dfrac{dy}{dx}$.`, 1], ['b', R`Find the values of $x$ at the stationary points.`, 2]],
    [['A1', R`(a) $\dfrac{dy}{dx} = 6x^2 - 18x + 12$`], ['M1', R`(b) Sets $6(x^2 - 3x + 2) = 0 \implies 6(x-1)(x-2) = 0$`], ['A1', R`$x = 1,\ x = 2$`]],
    R`(a) $6x^2 - 18x + 12$  (b) $x = 1,\ x = 2$`],

  // GCSE 1MA1 Quadratics
  ['gcs1', 'gcse-quadratics-factorising', 'easy', 3, false, R`Factorise fully: $3x^2 + 10x + 8$.`, null,
    [['M1', R`Finds factors of $3 \times 8 = 24$ that sum to 10: $4$ and $6$`], ['M1', R`$3x^2 + 6x + 4x + 8 = 3x(x+2) + 4(x+2)$`], ['A1', R`$(3x + 4)(x + 2)$`]], R`$(3x+4)(x+2)$`],

  // GCSE 1MA1 3D Trig
  ['gcs2', 'gcse-trig-pythagoras', 'easy', 4, true, R`A cuboid has dimensions $4\text{ cm} \times 5\text{ cm} \times 7\text{ cm}$. Calculate the length of the internal diagonal of the cuboid, giving your answer correct to 3 significant figures.`, null,
    [['M1', R`$d^2 = 4^2 + 5^2 + 7^2$`], ['A1', R`$d^2 = 16 + 25 + 49 = 90$`], ['M1', R`$d = \sqrt{90}$`], ['A1', R`$d = 9.49\text{ cm}$`]], R`$9.49\text{ cm}$`],

  // GCSE 1MA1 Probability
  ['gcs3', 'gcse-conditional-prob', 'easy', 3, false, R`There are 7 green sweets and 3 yellow sweets in a bag. Hannah takes two sweets at random without replacement. Calculate the probability that both sweets are green.`, null,
    [['M1', R`$P(G_1) = \frac{7}{10}$`], ['M1', R`$P(G_2|G_1) = \frac{6}{9}$`], ['A1', R`$\frac{7}{10} \times \frac{6}{9} = \frac{42}{90} = \frac{7}{15}$`]], R`$\frac{7}{15}$`],
];
