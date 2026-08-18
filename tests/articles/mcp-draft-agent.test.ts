import { spawn } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function rpc(message: object) {
  return `${JSON.stringify(message)}\n`;
}

describe('moneypick draft MCP agent', () => {
  it('publishes the shared article fields in saveDraft', async () => {
    const output = await new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, [path.resolve('mcp/moneypick-draft-agent.mjs')], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
      child.on('error', reject);
      child.on('close', (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr || `exit ${code}`)));
      child.stdin.end(rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }));
    });

    const body = output.split(/\r?\n/).find((line) => line.trim().startsWith('{')) ?? '';
    const response = JSON.parse(body);
    const properties = response.result.tools[0].inputSchema.properties;
    expect(response.result.tools[0].name).toBe('saveDraft');
    expect(properties).toHaveProperty('summaryItems');
    expect(properties).toHaveProperty('faq');
    expect(properties).toHaveProperty('articleType');
    expect(properties).toHaveProperty('patternId');
    expect(properties).toHaveProperty('relatedCalculators');
  });
});
