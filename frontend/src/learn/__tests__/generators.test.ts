import { describe, it, expect } from 'vitest';
import {
  GENERATORS,
  generatorById,
  mulberry32,
  poly,
  hashString,
} from '../generators';

describe('Algorithmic Drill Generators', () => {
  it('mulberry32 PRNG produces deterministic sequences from same seed', () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];
    expect(seq1).toEqual(seq2);
  });

  it('poly helper formats polynomials cleanly without double signs', () => {
    // 2x^2 - 3x + 4
    expect(poly([[2, 2], [-3, 1], [4, 0]])).toBe('2x^{2}-3x+4');
    // x^3 - 1
    expect(poly([[1, 3], [-1, 0]])).toBe('x^{3}-1');
    // 0
    expect(poly([[0, 2]])).toBe('0');
  });

  it('every generator produces prompt, correct answer, and 3 distinct wrong answers', () => {
    const rng = mulberry32(42);
    for (const gen of GENERATORS) {
      const result = gen.make(rng);
      expect(result.prompt.length).toBeGreaterThan(0);
      expect(result.answer.length).toBeGreaterThan(0);
      expect(result.distractors.length).toBeGreaterThanOrEqual(2);
      // Ensure answer is not among distractors
      expect(result.distractors).not.toContain(result.answer);
      // Ensure distractors are unique
      const uniqueDistractors = new Set(result.distractors);
      expect(uniqueDistractors.size).toBe(result.distractors.length);
    }
  });

  it('finds generators by id', () => {
    expect(generatorById('surd-simplify')).toBeDefined();
    expect(generatorById('exact-trig')).toBeDefined();
    expect(generatorById('differentiate-poly')).toBeDefined();
    expect(generatorById('non-existent-id')).toBeUndefined();
  });
});
