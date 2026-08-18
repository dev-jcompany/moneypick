import { describe, expect, it } from 'vitest';
import { normalizeRelatedCalculators } from '../../lib/article-calculators';

const valid = [
  { label: 'DSR', href: '/calculators/dsr' },
  { label: 'Mortgage', href: '/calculators/mortgage' },
  { label: 'Jeonse', href: '/calculators/jeonse-loan' },
  { label: 'Tax', href: '/calculators/acquisition-tax' },
];

describe('calculator CTA normalization', () => {
  it.each([0, 1, 2, 3])('keeps %i valid CTA items', (count) => {
    expect(normalizeRelatedCalculators(valid.slice(0, count), 'loan')).toHaveLength(count);
  });

  it('limits four or more items to three', () => {
    expect(normalizeRelatedCalculators(valid, 'loan')).toHaveLength(3);
  });

  it('removes invalid and duplicate slugs', () => {
    expect(normalizeRelatedCalculators([
      valid[0],
      { label: 'Duplicate', href: valid[0].href },
      { label: 'Invalid', href: '/calculators/not-real' },
    ], 'loan')).toEqual([valid[0]]);
  });
});
