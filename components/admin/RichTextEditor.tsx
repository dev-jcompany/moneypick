'use client';

import { useEffect, useRef, useState } from 'react';

function stripDangerousStyles(html: string): string {
  // inline style 속성에서 background/color/font-family 제거
  return html.replace(/style="([^"]*)"/gi, (_, styles: string) => {
    const cleaned = styles
      .split(';')
      .map((s) => s.trim())
      .filter((s) => {
        const prop = s.split(':')[0]?.trim().toLowerCase() ?? '';
        return !['background', 'background-color', 'color', 'font-family', 'font-size',
          'width', 'max-width', 'min-width', 'margin', 'margin-left', 'margin-right',
          'position', 'left', 'right', 'top', 'bottom', 'float', 'display'].includes(prop);
      })
      .join('; ');
    return cleaned ? `style="${cleaned}"` : '';
  });
}

// 블록 요소 사이에 브라우저가 자동 삽입한 <br> 태그 제거
const BLOCK = '(?:div|p|h[1-6]|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|blockquote|pre|article|section|figure|figcaption|header|footer|aside|nav|hr)';
function cleanBrTags(html: string): string {
  return html
    // 닫는 블록 태그 바로 뒤 <br>
    .replace(new RegExp(`(</${BLOCK}>)\\s*<br\\s*/?>\\s*`, 'gi'), '$1')
    // 여는 블록 태그 바로 앞 <br>
    .replace(new RegExp(`\\s*<br\\s*/?>\\s*(<${BLOCK}[\\s>])`, 'gi'), '$1')
    // 문서 맨 앞 <br>
    .replace(/^(\s*<br\s*\/?>\s*)+/i, '')
    // 연속 3개 이상의 <br>은 2개로 제한
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
}

function extractPasteHtml(clipboardData: DataTransfer): string {
  let html = clipboardData.getData('text/html');
  if (html) {
    if (/<html/i.test(html)) {
      const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      html = m ? m[1] : html;
    }
    html = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
    return cleanBrTags(stripDangerousStyles(html));
  }
  const plain = clipboardData.getData('text/plain');
  // 텍스트가 HTML 태그를 포함하면 HTML로 처리 (줄바꿈→<br> 금지)
  if (/<[a-z][^>]*>/i.test(plain)) {
    return cleanBrTags(stripDangerousStyles(plain));
  }
  return plain.replace(/\n/g, '<br>');
}

function Divider() {
  return <span className="mx-0.5 w-px self-stretch bg-[#DDE5E1]" aria-hidden="true" />;
}

function ToolBtn({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors hover:bg-white hover:text-[#17794A] hover:shadow-sm ${
        active ? 'bg-white text-[#17794A] shadow-sm' : 'text-slate-600'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요.',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [htmlSource, setHtmlSource] = useState(value);

  useEffect(() => {
    if (mode === 'visual' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, mode]);

  const cmd = (name: string, arg?: string) => {
    document.execCommand(name, false, arg);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? '');
  };

  const switchToHtml = () => {
    // innerHTML 대신 value 사용 — 브라우저가 추가한 <br> 노이즈 방지
    setHtmlSource(cleanBrTags(value));
    setMode('html');
  };

  const applyHtml = () => {
    onChange(cleanBrTags(stripDangerousStyles(htmlSource)));
    setMode('visual');
  };

  const insertLink = () => {
    const url = window.prompt('연결할 URL을 입력하세요.');
    if (url) cmd('createLink', url);
  };

  const insertImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cmd('insertImage', String(reader.result));
    reader.readAsDataURL(file);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = extractPasteHtml(event.clipboardData);
    document.execCommand('insertHTML', false, html);
    onChange(editorRef.current?.innerHTML ?? '');
  };

  return (
    <div className="rounded-2xl border border-[#DDE5E1] bg-white focus-within:border-[#21A05A] focus-within:ring-2 focus-within:ring-[#21A05A]/10 overflow-x-auto">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E7ECE9] bg-[#F7F9F8] p-2">
        {mode === 'visual' && (
          <>
            {/* 서식 */}
            <ToolBtn title="굵게 (Ctrl+B)" onClick={() => cmd('bold')}><b>B</b></ToolBtn>
            <ToolBtn title="기울임 (Ctrl+I)" onClick={() => cmd('italic')}><i>I</i></ToolBtn>
            <ToolBtn title="밑줄 (Ctrl+U)" onClick={() => cmd('underline')}><u>U</u></ToolBtn>
            <ToolBtn title="취소선" onClick={() => cmd('strikeThrough')}><s>S</s></ToolBtn>
            <Divider />
            {/* 제목 */}
            <ToolBtn title="제목 1" onClick={() => cmd('formatBlock', 'H1')}>H1</ToolBtn>
            <ToolBtn title="제목 2" onClick={() => cmd('formatBlock', 'H2')}>H2</ToolBtn>
            <ToolBtn title="제목 3" onClick={() => cmd('formatBlock', 'H3')}>H3</ToolBtn>
            <ToolBtn title="본문" onClick={() => cmd('formatBlock', 'P')}>P</ToolBtn>
            <Divider />
            {/* 정렬 */}
            <ToolBtn title="왼쪽 정렬" onClick={() => cmd('justifyLeft')}>≡←</ToolBtn>
            <ToolBtn title="가운데 정렬" onClick={() => cmd('justifyCenter')}>≡≡</ToolBtn>
            <ToolBtn title="오른쪽 정렬" onClick={() => cmd('justifyRight')}>→≡</ToolBtn>
            <Divider />
            {/* 목록 */}
            <ToolBtn title="순서 없는 목록" onClick={() => cmd('insertUnorderedList')}>• 목록</ToolBtn>
            <ToolBtn title="번호 목록" onClick={() => cmd('insertOrderedList')}>1. 번호</ToolBtn>
            <ToolBtn title="인용구" onClick={() => cmd('formatBlock', 'BLOCKQUOTE')}>인용</ToolBtn>
            <ToolBtn title="구분선" onClick={() => cmd('insertHorizontalRule')}>—</ToolBtn>
            <Divider />
            {/* 삽입 */}
            <ToolBtn title="링크 삽입" onClick={insertLink}>🔗 링크</ToolBtn>
            <ToolBtn title="이미지 삽입" onClick={() => fileRef.current?.click()}>🖼 이미지</ToolBtn>
            <Divider />
            <ToolBtn title="서식 지우기" onClick={() => cmd('removeFormat')}>서식지우기</ToolBtn>
          </>
        )}

        {/* 비주얼 / HTML 소스 탭 */}
        <div className="ml-auto flex overflow-hidden rounded-lg border border-[#DDE5E1]">
          <button
            type="button"
            onClick={applyHtml}
            className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${
              mode === 'visual' ? 'bg-[#21A05A] text-white' : 'bg-white text-slate-500 hover:bg-[#F6F8FA]'
            }`}
          >
            비주얼
          </button>
          <button
            type="button"
            onClick={switchToHtml}
            className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${
              mode === 'html' ? 'bg-[#21A05A] text-white' : 'bg-white text-slate-500 hover:bg-[#F6F8FA]'
            }`}
          >
            HTML 소스
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => insertImage(e.target.files?.[0])}
        />
      </div>

      {/* 비주얼 에디터 */}
      {mode === 'visual' && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onPaste={handlePaste}
          className="admin-editor min-h-[420px] px-6 py-5 text-[15px] leading-8 text-[#29332F] outline-none"
        />
      )}

      {/* HTML 소스 에디터 */}
      {mode === 'html' && (
        <div className="relative">
          <textarea
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            spellCheck={false}
            placeholder="HTML 소스를 붙여넣거나 직접 입력하세요..."
            className="min-h-[420px] w-full resize-y bg-[#1E1E2E] px-6 py-5 font-mono text-[13px] leading-6 text-[#CDD6F4] outline-none"
          />
          <button
            type="button"
            onClick={applyHtml}
            className="absolute bottom-4 right-4 rounded-xl bg-[#21A05A] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#17794A]"
          >
            비주얼 모드로 적용 →
          </button>
        </div>
      )}
    </div>
  );
}
