import { describe, it, expect } from 'vitest';
import { tokenize } from '../../components/learn/MathText';

describe('MathText Tokenizer', () => {
  it('correctly tokenizes inline math without eating currency', () => {
    const input = 'Solve for $x$: $2x + 1 = 5$. Price is $5000.';
    const tokens = tokenize(input);

    // Should have math for $x$ and $2x + 1 = 5$
    const mathTokens = tokens.filter((t) => t.type === 'math');
    expect(mathTokens.length).toBe(2);
    expect(mathTokens[0].value).toBe('x');
    expect(mathTokens[1].value).toBe('2x + 1 = 5');

    // $5000 followed by a dot should remain text
    const textTokens = tokens.filter((t) => t.type === 'text');
    const fullText = textTokens.map((t) => t.value).join(' ');
    expect(fullText).toContain('$5000.');
  });

  it('correctly handles escaped dollar signs \\$', () => {
    const input = 'The deposit was \\$500 and interest was 5%.';
    const tokens = tokenize(input);
    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe('text');
    expect(tokens[0].value).toBe('The deposit was $500 and interest was 5%.');
  });

  it('handles display math $$...$$', () => {
    const input = 'Equation:\n$$\\int x\\,dx = \\frac{x^2}{2} + C$$\nDone.';
    const tokens = tokenize(input);
    const displayMath = tokens.find((t) => t.type === 'math' && t.display);
    expect(displayMath).toBeDefined();
    expect(displayMath?.value).toBe('\\int x\\,dx = \\frac{x^2}{2} + C');
  });

  it('handles **bold** and *italic* formatting', () => {
    const input = 'This is **essential** and *important*.';
    const tokens = tokenize(input);
    const boldToken = tokens.find((t) => t.type === 'bold');
    const italicToken = tokens.find((t) => t.type === 'italic');
    expect(boldToken).toBeDefined();
    expect(italicToken).toBeDefined();
  });
});
