import { describe, expect, it } from 'vitest';
import { adminPath, safeAdminReturnPath } from '../../lib/admin-path';

describe('safeAdminReturnPath', () => {
  it('keeps valid admin destinations', () => {
    expect(safeAdminReturnPath(adminPath('/inquiries?state=open'))).toBe(adminPath('/inquiries?state=open'));
  });

  it.each([
    'https://evil.example/steal',
    '//evil.example/steal',
    '/outside-admin',
    `${adminPath()}\\@evil.example`,
  ])('rejects an unsafe return path: %s', (value) => {
    expect(safeAdminReturnPath(value)).toBe(adminPath());
  });
});
