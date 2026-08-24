import type { PlannedVisual } from './visual-system.mjs';
export class ImageGenerationError extends Error { constructor(message: string, code?: string, retryable?: boolean); code: string; retryable: boolean; }
export function createOpenAIImageProvider(options?: Record<string, unknown>): { name: string; model: string; generate(input: { prompt: string; visual?: PlannedVisual }): Promise<{ bytes: Buffer; mimeType: string }> };
export function createSupabaseVisualStorage(options?: Record<string, unknown>): { name: string; bucket: string; upload(input: { path: string; bytes: Buffer; mimeType: string }): Promise<string> };
export function safeArticleAssetPath(articleId: string, visualId: string, bytes: Buffer): string;
export function generateArticleVisualAssets(input: { articleId: string; articleTopic: string; visuals: PlannedVisual[]; provider: { generate(input: { prompt: string; visual?: PlannedVisual }): Promise<{ bytes: Buffer; mimeType: string }> }; storage: { upload(input: { path: string; bytes: Buffer; mimeType: string }): Promise<string> }; retry?: number; logger?: Pick<Console, 'warn'> }): Promise<{ visuals: PlannedVisual[]; failures: Array<{ id: string; code: string }> }>;
