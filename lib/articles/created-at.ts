export function normalizeEditableCreatedAt(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error('등록일 형식이 올바르지 않습니다.');

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error('등록일 형식이 올바르지 않습니다.');
  return new Date(timestamp).toISOString();
}
