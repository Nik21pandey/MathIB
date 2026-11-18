// IB MYP Mathematics (criteria A, B, D) and Cambridge A Level 9709 - original GenIB content.
const R = String.raw;

// Student-friendly achievement bands written for GenIB (not the IB's published descriptors).
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
    blurb: 'Practice built around the four assessment criteria. Criterion B investigations and Criterion D real-life tasks are interactive.',
    papers: [],
    sections: [
      { slug: 'criterion-a', name: 'Criterion A: Knowing and Understanding', blurb: 'Topic tests written with MYP command terms: state, describe, explain, justify.' },
      { slug: 'criterion-b', name: 'Criterion B: Investigating Patterns', hub: true, blurb: 'Fill in the pattern table, predict, find the general rule, then verify and justify it. Criterion C (communicating) is assessed through the way you set this out.' },
      { slug: 'criterion-d', name: 'Criterion D: Applying Mathematics in Real-Life Contexts', hub: true, blurb: 'Model a real situation, solve it, and comment on accuracy and whether the answer makes sense.' },
    ],
  },
  {
    slug: 'a-level-9709', board: 'cambridge', code: '9709', name: 'Cambridge International AS & A Level Mathematics', short: 'A Level 9709', level: 'a-level', status: 'live',
    blurb: 'Pure Mathematics 1 to begin with.',
    papers: [{ name: 'Paper 1: Pure Mathematics 1', calc: true, duration: '1 hour 50 minutes', marks: 75 }],
    sections: [{ slug: 'pure-mathematics-1', name: 'Pure Mathematics 1', blurb: 'Series and differentiation.' }],
  },
  { slug: 'igcse-0607', board: 'cambridge', code: '0607', name: 'Cambridge IGCSE International Mathematics', short: 'IGCSE 0607', level: 'igcse-ext', status: 'soon', blurb: 'Coming next.', papers: [], sections: [] },
  { slug: 'igcse-0606', board: 'cambridge', code: '0606', name: 'Cambridge IGCSE Additional Mathematics', short: 'IGCSE 0606', level: 'igcse-ext', status: 'soon', blurb: 'Coming next.', papers: [], sections: [] },
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
