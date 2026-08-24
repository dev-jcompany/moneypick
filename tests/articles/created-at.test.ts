import { describe, expect, it } from 'vitest';
import { normalizeEditableCreatedAt } from '../../lib/articles/created-at';

describe('editable article registration date', () => {
  it('normalizes a valid date to ISO', () => {
    expect(normalizeEditableCreatedAt('2026-08-25T09:30:00+09:00')).toBe('2026-08-25T00:30:00.000Z');
  });

  it('keeps an omitted date undefined so the database default is used', () => {
    expect(normalizeEditableCreatedAt(undefined)).toBeUndefined();
  });

  it('rejects an invalid date', () => {
    expect(() => normalizeEditableCreatedAt('not-a-date')).toThrow('등록일 형식이 올바르지 않습니다.');
  });
});
