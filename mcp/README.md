# MoneyPick Draft MCP Agent

Claude Desktop에서 작성한 원고를 머니픽 관리자에 임시저장으로 등록하는 로컬 MCP 에이전트입니다.

## 환경변수

`mcp/.env` 파일을 만들고 아래 값을 설정합니다.

```env
ADMIN_API_URL=https://www.moneypick.co.kr
ADMIN_API_KEY=배포환경과_같은_관리자_API_KEY
```

## Claude Desktop 설정 예시

```json
{
  "mcpServers": {
    "moneypick-draft": {
      "command": "node",
      "args": ["D:\\Project\\07_moneypick\\mcp\\moneypick-draft-agent.mjs"]
    }
  }
}
```

## 제공 도구

- `saveDraft`: title, seoTitle, slug, category, summary, contentHtml, tags를 받아 관리자 API에 임시저장 글을 생성합니다.

발행은 자동으로 하지 않습니다. 관리자 화면에서 검수 후 수동 발행합니다.
