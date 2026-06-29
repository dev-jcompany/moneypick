#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

loadEnv(path.join(projectRoot, '.env.local'));
loadEnv(path.join(__dirname, '.env'));

let buffer = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  readMessages();
});

process.stdin.on('error', (error) => {
  console.error('[moneypick-draft-agent] stdin error:', error);
});

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function readMessages() {
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const header = buffer.slice(0, headerEnd).toString('utf8');
    const contentLengthMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!contentLengthMatch) {
      buffer = Buffer.alloc(0);
      console.error('[moneypick-draft-agent] Missing Content-Length header.');
      return;
    }

    const contentLength = Number(contentLengthMatch[1]);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + contentLength;
    if (buffer.length < messageEnd) return;

    const rawMessage = buffer.slice(messageStart, messageEnd).toString('utf8');
    buffer = buffer.slice(messageEnd);

    void handleMessage(rawMessage);
  }
}

async function handleMessage(rawMessage) {
  let message;
  try {
    message = JSON.parse(rawMessage);
  } catch {
    return;
  }

  if (message.id == null) return;

  try {
    if (message.method === 'initialize') {
      send({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: message.params?.protocolVersion ?? '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'moneypick-draft-agent', version: '0.2.2' },
        },
      });
      return;
    }

    if (message.method === 'tools/list') {
      send({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          tools: [
            {
              name: 'saveDraft',
              description: 'Register a MoneyPick article as a draft through the admin API.',
              inputSchema: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'slug', 'category', 'summary', 'contentHtml'],
                properties: {
                  title: { type: 'string', description: 'Article title' },
                  seoTitle: { type: 'string', description: 'SEO title' },
                  slug: { type: 'string', description: 'URL slug' },
                  category: { type: 'string', description: 'Category label or key' },
                  summary: { type: 'string', description: 'Summary or lead text' },
                  contentHtml: { type: 'string', description: 'Article body HTML' },
                  tags: { type: 'array', items: { type: 'string' }, description: 'Tag list' },
                  heroStat: { type: 'string', description: 'Combined hero metric in "value / label" format' },
                  heroValue: { type: 'string', description: 'Hero metric value' },
                  heroLabel: { type: 'string', description: 'Hero metric label' },
                  readingTime: { type: 'string', description: 'Reading time label' },
                  thumbnailUrl: { type: 'string', description: 'Thumbnail image URL' },
                  metaDescription: { type: 'string', description: 'Meta description' },
                },
              },
            },
          ],
        },
      });
      return;
    }

    if (message.method === 'tools/call') {
      if (message.params?.name !== 'saveDraft') {
        sendError(message.id, -32602, 'Unknown tool.');
        return;
      }

      const result = await saveDraft(message.params.arguments ?? {});
      send({ jsonrpc: '2.0', id: message.id, result });
      return;
    }

    sendError(message.id, -32601, 'Method not found.');
  } catch (error) {
    send({
      jsonrpc: '2.0',
      id: message.id,
      result: {
        isError: true,
        content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unknown error.' }],
      },
    });
  }
}

async function saveDraft(args) {
  const adminApiUrl = process.env.ADMIN_API_URL?.trim();
  const adminApiKey = process.env.ADMIN_API_KEY?.trim();

  if (!adminApiUrl || !adminApiKey) {
    return errorResult('Set ADMIN_API_URL and ADMIN_API_KEY in mcp/.env.');
  }

  const validationError = validateDraft(args);
  if (validationError) return errorResult(validationError);

  const response = await fetch(buildEndpoint(adminApiUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminApiKey}`,
    },
    body: JSON.stringify({
      title: args.title.trim(),
      seoTitle: optionalString(args.seoTitle),
      slug: args.slug.trim(),
      category: args.category.trim(),
      summary: args.summary.trim(),
      contentHtml: args.contentHtml.trim(),
      tags: Array.isArray(args.tags) ? args.tags : [],
      heroStat: optionalString(args.heroStat),
      heroValue: optionalString(args.heroValue),
      heroLabel: optionalString(args.heroLabel),
      readingTime: optionalString(args.readingTime),
      thumbnailUrl: optionalString(args.thumbnailUrl),
      metaDescription: optionalString(args.metaDescription),
      status: 'draft',
      source: 'claude_desktop',
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return errorResult(`Draft registration failed (${response.status}): ${data?.error ?? response.statusText}`);
  }

  const warning = Array.isArray(data?.ignoredColumns) && data.ignoredColumns.length
    ? `\nIgnored DB columns: ${data.ignoredColumns.join(', ')}`
    : '';

  return {
    content: [
      {
        type: 'text',
        text: `MoneyPick draft saved.\narticleId: ${data.articleId}\neditUrl: ${data.editUrl}${warning}`,
      },
    ],
  };
}

function validateDraft(args) {
  const requiredFields = ['title', 'slug', 'category', 'summary', 'contentHtml'];
  for (const field of requiredFields) {
    if (typeof args[field] !== 'string' || !args[field].trim()) {
      return `${field} is required.`;
    }
  }

  if (args.tags != null && (!Array.isArray(args.tags) || args.tags.some((tag) => typeof tag !== 'string'))) {
    return 'tags must be an array of strings.';
  }

  return null;
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function buildEndpoint(adminApiUrl) {
  const trimmed = adminApiUrl.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/admin/articles/draft')) return trimmed;
  return `${trimmed}/api/admin/articles/draft`;
}

function errorResult(text) {
  return { isError: true, content: [{ type: 'text', text }] };
}

function sendError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function send(message) {
  const json = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`);
}
