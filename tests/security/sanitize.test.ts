import { describe, expect, it } from 'vitest';
import { sanitizePostHtml } from '../../lib/sanitize';

describe('sanitizePostHtml', () => {
  it('removes executable markup and attributes', () => {
    const output = sanitizePostHtml(
      '<p onclick="alert(1)"><a href="javascript:alert(1)">link</a><img src="https://example.com/a.png" onerror="alert(1)"><script>alert(1)</script></p>',
    );

    expect(output).not.toMatch(/onclick|onerror|javascript:|<script/i);
    expect(output).toContain('<p>');
    expect(output).toContain('https://example.com/a.png');
  });

  it('blocks protocol-relative and data image sources', () => {
    const output = sanitizePostHtml('<img src="//evil.example/a.png"><img src="data:text/html,bad">');
    expect(output).not.toContain('//evil.example');
    expect(output).not.toContain('data:text/html');
  });
});
