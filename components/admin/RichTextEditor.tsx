'use client';

import { useEffect, useRef } from 'react';

export default function RichTextEditor({ value, onChange, placeholder = '내용을 입력하세요.' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  const command = (name: string, argument?: string) => {
    document.execCommand(name, false, argument);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? '');
  };

  const insertLink = () => {
    const url = window.prompt('연결할 URL을 입력하세요.');
    if (url) command('createLink', url);
  };

  const insertImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => command('insertImage', String(reader.result));
    reader.readAsDataURL(file);
  };

  const tools = [
    ['굵게', 'bold', 'B'], ['기울임', 'italic', 'I'], ['밑줄', 'underline', 'U'],
    ['제목', 'formatBlock', 'H2'], ['인용', 'formatBlock', 'BLOCKQUOTE'],
    ['목록', 'insertUnorderedList', '• 목록'], ['번호', 'insertOrderedList', '1. 목록'],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#DDE5E1] bg-white focus-within:border-[#21A05A] focus-within:ring-2 focus-within:ring-[#21A05A]/10">
      <div className="flex flex-wrap gap-1 border-b border-[#E7ECE9] bg-[#F7F9F8] p-2">
        {tools.map(([label, name, argument]) => <button key={label} type="button" title={label} onClick={() => command(name, argument)} className="min-w-9 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#17794A] hover:shadow-sm">{label === '굵게' ? <b>B</b> : label === '기울임' ? <i>I</i> : label === '밑줄' ? <u>U</u> : argument}</button>)}
        <span className="mx-1 w-px bg-[#DDE5E1]" />
        <button type="button" onClick={insertLink} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white">🔗 링크</button>
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white">▧ 사진 추가</button>
        <button type="button" onClick={() => command('removeFormat')} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white">서식 지우기</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => insertImage(event.target.files?.[0])} />
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning data-placeholder={placeholder} onInput={(event) => onChange(event.currentTarget.innerHTML)} className="admin-editor min-h-[360px] px-6 py-5 text-[15px] leading-8 text-[#29332F] outline-none" />
    </div>
  );
}
