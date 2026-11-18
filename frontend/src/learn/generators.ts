// Algorithmic question generators.
//
// Each generator turns a seeded random source into one question with a correct answer
// and plausible wrong answers (each wrong answer is a specific common mistake).
// The same generators power the fluency drills, the Daily 5 and challenge links:
// because they are seeded, a link can recreate exactly the same questions for a friend.

export type Rng = () => number;

export interface Generated {
  prompt: string;
  answer: string;
  distractors: string[];
}

export interface GeneratorDef {
  id: string;
  title: string;
  make: (rng: Rng) => Generated;
}

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const randInt = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
export const pick = <T,>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const nonZero = (rng: Rng, lo: number, hi: number) => {
  let v = 0;
  while (v === 0) v = randInt(rng, lo, hi);
  return v;
};

const m = (tex: string) => `$${tex}$`;

/** Formats a polynomial in one variable from [coefficient, power] pairs. */
export function poly(terms: [number, number][], v = 'x'): string {
  let out = '';
  for (const [c, p] of terms) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const sign = c < 0 ? '-' : out ? '+' : '';
    const coef = abs === 1 && p !== 0 ? '' : String(abs);
    const body = p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
    out += `${sign}${coef}${body}`;
  }
  return out || '0';
}

const signed = (n: number) => (n < 0 ? `-${Math.abs(n)}` : `+${n}`);
const choose = (n: number, k: number) => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
};

/** Keeps three distinct wrong answers, none equal to the right one. */
function finish(prompt: string, answer: string, candidates: string[]): Generated {
  const seen = new Set([answer]);
  const distractors: string[] = [];
  for (const c of candidates) {
    if (distractors.length === 3) break;
    if (!seen.has(c)) {
      seen.add(c);
      distractors.push(c);
    }
  }
  return { prompt, answer, distractors };
}

/** As finish(), for whole-number answers: pads with near misses if mistakes coincide. */
function finishNumber(prompt: string, answer: number, candidates: number[], fmt: (n: number) => string = (n) => m(String(n))): Generated {
  const padded = [...candidates.filter((c) => Number.isFinite(c)), answer + 1, answer - 1, answer + 2, answer + 10];
  return finish(prompt, fmt(answer), padded.map(fmt));
}

const TRIG: Record<string, Record<number, string>> = {
  sin: { 0: '0', 30: '\\dfrac{1}{2}', 45: '\\dfrac{\\sqrt{2}}{2}', 60: '\\dfrac{\\sqrt{3}}{2}', 90: '1' },
  cos: { 0: '1', 30: '\\dfrac{\\sqrt{3}}{2}', 45: '\\dfrac{\\sqrt{2}}{2}', 60: '\\dfrac{1}{2}', 90: '0' },
  tan: { 0: '0', 30: '\\dfrac{\\sqrt{3}}{3}', 45: '1', 60: '\\sqrt{3}' },
};
const TRIG_VALUES = ['0', '\\dfrac{1}{2}', '\\dfrac{\\sqrt{2}}{2}', '\\dfrac{\\sqrt{3}}{2}', '1', '\\dfrac{\\sqrt{3}}{3}', '\\sqrt{3}'];

// [number, numerator of power, denominator of power, value]
const INDEX_FACTS: [number, number, number, number][] = [
  [8, 2, 3, 4], [27, 2, 3, 9], [16, 3, 4, 8], [25, 3, 2, 125], [4, 5, 2, 32], [32, 3, 5, 8],
  [81, 3, 4, 27], [64, 2, 3, 16], [9, 3, 2, 27], [8, 4, 3, 16], [16, 3, 2, 64], [125, 2, 3, 25],
];

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15]];

export const GENERATORS: GeneratorDef[] = [
  {
    id: 'surd-simplify',
    title: 'Simplifying surds',
    make: (rng) => {
      const k = pick(rng, [2, 3, 5, 6, 7]);
      const a = randInt(rng, 2, 6);
      return finish(`Simplify ${m(`\\sqrt{${a * a * k}}`)}.`, m(`${a}\\sqrt{${k}}`), [
        m(`${a * a}\\sqrt{${k}}`),
        m(`${k}\\sqrt{${a}}`),
        m(`${a + 1}\\sqrt{${k}}`),
        m(`${a}\\sqrt{${a * k}}`),
        m(`${a - 1}\\sqrt{${k}}`),
      ]);
    },
  },
  {
    id: 'surd-rationalise',
    title: 'Rationalising denominators',
    make: (rng) => {
      const b = pick(rng, [2, 3, 5, 7]);
      const c = randInt(rng, 2, 6);
      const a = b * c;
      return finish(`Rationalise the denominator of ${m(`\\dfrac{${a}}{\\sqrt{${b}}}`)}.`, m(`${c}\\sqrt{${b}}`), [
        m(`${a}\\sqrt{${b}}`),
        m(`\\dfrac{\\sqrt{${b}}}{${a}}`),
        m(`${c}`),
        m(`${c + 1}\\sqrt{${b}}`),
        m(`${b}\\sqrt{${c}}`),
      ]);
    },
  },
  {
    id: 'exact-trig',
    title: 'Exact trigonometric values',
    make: (rng) => {
      const fn = pick(rng, ['sin', 'cos', 'tan']);
      const angle = pick(rng, Object.keys(TRIG[fn]).map(Number));
      const answer = TRIG[fn][angle];
      return finish(`Write down the exact value of ${m(`\\${fn} ${angle}^\\circ`)}.`, m(answer), shuffle(rng, TRIG_VALUES).map(m));
    },
  },
  {
    id: 'indices-evaluate',
    title: 'Fractional and negative indices',
    make: (rng) => {
      const [n, p, q, value] = pick(rng, INDEX_FACTS);
      const root = Math.round(Math.pow(n, 1 / q));
      if (rng() < 0.4) {
        return finish(`Work out ${m(`${n}^{-\\frac{${p}}{${q}}}`)}.`, m(`\\dfrac{1}{${value}}`), [
          m(`-${value}`),
          m(`${value}`),
          m(`-\\dfrac{1}{${value}}`),
          m(`\\dfrac{1}{${value * 2}}`),
        ]);
      }
      return finishNumber(`Work out ${m(`${n}^{\\frac{${p}}{${q}}}`)}.`, value, [
        (n * p) / q === Math.round((n * p) / q) ? (n * p) / q : root * p,
        root * p,
        value * 2,
        root,
      ]);
    },
  },
  {
    id: 'linear-eq',
    title: 'Solving linear equations',
    make: (rng) => {
      const a = randInt(rng, 2, 9);
      const x = nonZero(rng, -6, 9);
      const b = nonZero(rng, -9, 9);
      const c = a * x + b;
      const wrong = (c + b) / a;
      return finishNumber(
        `Solve ${m(`${a}x${signed(b)}=${c}`)}.`,
        x,
        [Number.isInteger(wrong) ? wrong : x + 2, -x, x + 1, x - 1],
        (n) => m(`x=${n}`),
      );
    },
  },
  {
    id: 'expand-double',
    title: 'Expanding double brackets',
    make: (rng) => {
      const a = nonZero(rng, -7, 7);
      const b = nonZero(rng, -7, 7);
      const q = (s: number, p: number) => m(poly([[1, 2], [s, 1], [p, 0]]));
      return finish(`Expand and simplify ${m(`(x${signed(a)})(x${signed(b)})`)}.`, q(a + b, a * b), [
        q(a + b, -a * b),
        q(a * b, a + b),
        q(0, a * b),
        q(-(a + b), a * b),
        q(a + b + 1, a * b),
        q(a + b, a * b + 1),
      ]);
    },
  },
  {
    id: 'factorise-quadratic',
    title: 'Factorising quadratics',
    make: (rng) => {
      let a = nonZero(rng, -7, 7);
      let b = nonZero(rng, -7, 7);
      while (a + b === 0) b = nonZero(rng, -7, 7);
      if (a > b) [a, b] = [b, a];
      const f = (p: number, q: number) => {
        const [lo, hi] = p <= q ? [p, q] : [q, p];
        return m(`(x${signed(lo)})(x${signed(hi)})`);
      };
      return finish(`Factorise ${m(poly([[1, 2], [a + b, 1], [a * b, 0]]))}.`, f(a, b), [
        f(-a, -b),
        f(-a, b),
        f(a, -b),
        f(a + 1, b - 1),
        f(a - 1, b + 1),
      ]);
    },
  },
  {
    id: 'nth-term-linear',
    title: 'nth term of a linear sequence',
    make: (rng) => {
      const d = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
      const c = randInt(rng, -9, 9);
      const terms = [1, 2, 3, 4].map((n) => d * n + c);
      const lin = (p: number, q: number) => m(poly([[p, 1], [q, 0]], 'n'));
      return finish(`Find the nth term of ${m(`${terms.join(',\\ ')},\\ \\ldots`)}`, lin(d, c), [
        lin(d, c + d),
        lin(c + d, d),
        lin(1, d),
        lin(d, -c),
        lin(d + 1, c - 1),
        lin(d, c + 1),
      ]);
    },
  },
  {
    id: 'nth-term-quadratic',
    title: 'nth term of a quadratic sequence',
    make: (rng) => {
      const a = randInt(rng, 1, 3);
      const b = randInt(rng, -3, 3);
      const c = randInt(rng, -4, 5);
      const terms = [1, 2, 3, 4, 5].map((n) => a * n * n + b * n + c);
      const quad = (p: number, q: number, r: number) => m(poly([[p, 2], [q, 1], [r, 0]], 'n'));
      return finish(`Find the nth term of ${m(`${terms.join(',\\ ')},\\ \\ldots`)}`, quad(a, b, c), [
        quad(2 * a, b, c),
        quad(a, -b, c),
        quad(a, b, -c),
        quad(a, b + 1, c),
        quad(a, b, c + 1),
        quad(a + 1, b, c),
      ]);
    },
  },
  {
    id: 'differentiate-poly',
    title: 'Differentiating polynomials',
    make: (rng) => {
      const n = randInt(rng, 3, 5);
      const p = randInt(rng, 1, 2);
      const a = randInt(rng, 2, 6);
      const b = nonZero(rng, -7, 7);
      const k = randInt(rng, 1, 9);
      return finish(
        `Find ${m('\\dfrac{dy}{dx}')} when ${m(`y=${poly([[a, n], [b, p], [k, 0]])}`)}.`,
        m(poly([[a * n, n - 1], [b * p, p - 1]])),
        [
          m(poly([[a * n, n], [b * p, p]])),
          m(poly([[a, n - 1], [b, p - 1]])),
          m(poly([[a * n, n - 1], [b * p, p]])),
          m(poly([[a * n, n - 1], [b, p]])),
          m(poly([[a * (n - 1), n - 1], [b * p, p - 1]])),
        ],
      );
    },
  },
  {
    id: 'integrate-poly',
    title: 'Integrating polynomials',
    make: (rng) => {
      const n = randInt(rng, 1, 4);
      const c = randInt(rng, 2, 4);
      const a = c * (n + 1);
      const b = randInt(rng, 1, 9);
      return finish(
        `Find ${m(`\\displaystyle\\int (${poly([[a, n], [b, 0]])})\\,dx`)}.`,
        m(`${poly([[c, n + 1], [b, 1]])}+C`),
        [
          m(`${poly([[a, n + 1], [b, 1]])}+C`),
          m(`${poly([[a * n, n - 1]])}+C`),
          m(`${poly([[c, n + 1], [b, 0]])}+C`),
          m(`${poly([[c, n], [b, 1]])}+C`),
        ],
      );
    },
  },
  {
    id: 'binomial-coefficient',
    title: 'Binomial coefficients',
    make: (rng) => {
      const n = randInt(rng, 4, 7);
      const k = randInt(rng, 2, 3);
      const a = randInt(rng, 2, 3);
      const c = choose(n, k);
      return finishNumber(`Find the coefficient of ${m(`x^{${k}}`)} in the expansion of ${m(`(1+${a}x)^{${n}}`)}.`, c * a ** k, [
        c,
        c * a,
        a ** k,
        n * a ** k,
      ]);
    },
  },
  {
    id: 'arithmetic-series',
    title: 'Arithmetic series',
    make: (rng) => {
      const a = randInt(rng, 1, 9);
      const d = randInt(rng, 2, 6);
      const n = pick(rng, [10, 12, 16, 20]);
      const last = a + (n - 1) * d;
      return finishNumber(
        `An arithmetic sequence has first term ${m(String(a))} and common difference ${m(String(d))}. Find the sum of the first ${m(String(n))} terms.`,
        (n / 2) * (a + last),
        [(n / 2) * (2 * a + n * d), n * last, last, (n / 2) * last],
      );
    },
  },
  {
    id: 'log-evaluate',
    title: 'Evaluating logarithms',
    make: (rng) => {
      const b = pick(rng, [2, 3, 5]);
      const p = randInt(rng, 1, 4);
      const q = randInt(rng, 1, 3);
      return finishNumber(`Find the value of ${m(`\\log_{${b}}${b ** p}+\\log_{${b}}${b ** q}`)}.`, p + q, [
        p * q,
        b ** p + b ** q,
        Math.abs(p - q),
        b * (p + q),
      ]);
    },
  },
  {
    id: 'complex-modulus',
    title: 'Modulus of a complex number',
    make: (rng) => {
      const [x, y, r] = pick(rng, TRIPLES);
      const [a, b] = rng() < 0.5 ? [x, y] : [y, x];
      const sa = rng() < 0.3 ? -a : a;
      const sb = rng() < 0.5 ? -b : b;
      return finishNumber(`Find ${m(`|${sa}${signed(sb)}i|`)}.`, r, [a + b, r * r, Math.abs(a - b), sa + sb]);
    },
  },
  {
    id: 'percent-change',
    title: 'Percentage increase and decrease',
    make: (rng) => {
      const base = pick(rng, [40, 60, 80, 120, 200, 240]);
      const pct = pick(rng, [10, 20, 25, 30, 50, 75]);
      const up = rng() < 0.5;
      const change = (base * pct) / 100;
      return finishNumber(
        `${up ? 'Increase' : 'Decrease'} ${m(String(base))} by ${m(`${pct}\\%`)}.`,
        up ? base + change : base - change,
        [up ? base + pct : base - pct, change, up ? base - change : base + change, up ? base * pct : base / 2],
      );
    },
  },
];

export const generatorById = (id: string) => GENERATORS.find((g) => g.id === id);

export interface PracticeLevel { id: string; label: string; generators: string[] }

/** Daily 5 levels and the skills each one draws from. */
export const LEVELS: PracticeLevel[] = [
  {
    id: 'igcse-ext',
    label: 'IGCSE Extended',
    generators: ['surd-simplify', 'surd-rationalise', 'exact-trig', 'indices-evaluate', 'linear-eq', 'expand-double', 'factorise-quadratic', 'nth-term-linear', 'nth-term-quadratic', 'differentiate-poly'],
  },
  {
    id: 'myp-ext',
    label: 'MYP Extended',
    generators: ['linear-eq', 'expand-double', 'factorise-quadratic', 'nth-term-linear', 'nth-term-quadratic', 'percent-change'],
  },
  {
    id: 'ib-aa-hl',
    label: 'IBDP AA HL',
    generators: ['differentiate-poly', 'integrate-poly', 'binomial-coefficient', 'arithmetic-series', 'log-evaluate', 'complex-modulus', 'exact-trig'],
  },
  {
    id: 'a-level',
    label: 'A Level',
    generators: ['differentiate-poly', 'integrate-poly', 'binomial-coefficient', 'arithmetic-series', 'log-evaluate', 'indices-evaluate'],
  },
];
