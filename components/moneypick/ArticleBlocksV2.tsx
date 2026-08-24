import type { ArticleSchemaBlock } from '@/lib/article-system/article-schema.mjs';
import { ARTICLE_CALCULATOR_OPTIONS } from '@/lib/article-calculators';
import { OFFICIAL_AGENCIES } from '@/mcp/official-registry.mjs';

type Props = {
  blocks: ArticleSchemaBlock[];
  accent: string;
  accentDark: string;
};

function calculatorItems(block: Extract<ArticleSchemaBlock, { type: 'calculator' }>) {
  const known = new Map(ARTICLE_CALCULATOR_OPTIONS.map((item) => [item.href, item]));
  const seen = new Set<string>();
  return block.items.filter((item) => {
    if (!known.has(item.href) || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  }).slice(0, 3);
}

export default function ArticleBlocksV2({ blocks, accent, accentDark }: Props) {
  return (
    <div className="mp-v2-blocks">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={index} className="mb-4 mt-12 border-l-[5px] pl-4 text-[21px] font-extrabold leading-snug" style={{ borderColor: accent }}>{block.text}</h2>;
          case 'paragraph':
            return <p key={index} className="mb-6 text-[17px] leading-[1.85] text-[#2b322e] dark:text-slate-300">{block.text}</p>;
          case 'checklist':
            return <section key={index} className="my-6 rounded-2xl bg-[#f4f6f4] p-6 dark:bg-navy-900"><h3 className="mb-4 font-extrabold">✓ {block.title}</h3><ul className="list-disc space-y-2 pl-5">{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul></section>;
          case 'point':
            return <p key={index} className="my-6 rounded-2xl border-l-[5px] bg-green-50 p-5 font-semibold dark:bg-green-900/20" style={{ borderColor: accent }}>{block.text}</p>;
          case 'warning':
            return <aside key={index} className="my-6 rounded-2xl bg-amber-50 p-5 text-amber-950 dark:bg-amber-900/20 dark:text-amber-100">{block.title && <strong className="mb-1 block">⚠ {block.title}</strong>}{block.text}</aside>;
          case 'example':
            return <div key={index} className="my-6 whitespace-pre-line rounded-2xl bg-slate-50 p-5 dark:bg-navy-800">{block.text}</div>;
          case 'summary':
            return <section key={index} className="my-6 rounded-2xl bg-green-50 p-6 dark:bg-green-900/20"><h2 className="mb-3 font-extrabold" style={{ color: accentDark }}>핵심 요약</h2><ul className={block.variant === 'S2' ? 'grid gap-3 md:grid-cols-3' : 'space-y-2'}>{block.items.map((item, itemIndex) => <li key={itemIndex} className="rounded-xl bg-white/80 p-3 dark:bg-navy-800">✓ {item}</li>)}</ul></section>;
          case 'table':
            return <figure key={index} className="my-8 overflow-x-auto">{block.caption && <figcaption className="mb-3 font-bold">{block.caption}</figcaption>}<table className="w-full border-collapse text-left text-sm"><thead><tr>{block.headers.map((header, cellIndex) => <th key={cellIndex} className="border bg-slate-50 p-3 dark:bg-navy-800">{header}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border p-3">{cell}</td>)}</tr>)}</tbody></table></figure>;
          case 'calculator': {
            const items = calculatorItems(block);
            if (!items.length) return null;
            return <section key={index} className="my-8 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/15"><h2 className="mb-4 font-extrabold">관련 계산기</h2><div className="flex flex-wrap gap-3">{items.map((item) => <a key={item.href} href={item.href} className="rounded-xl border bg-white px-4 py-3 font-semibold dark:bg-navy-800" style={{ borderColor: accent, color: accentDark }}>🧮 {item.label}{item.caption ? <small className="ml-2 opacity-70">{item.caption}</small> : null}</a>)}</div></section>;
          }
          case 'faq':
            return <section key={index} className="my-8"><h2 className="mb-4 text-xl font-extrabold">자주 묻는 질문</h2><div className="overflow-hidden rounded-xl bg-[#0f1a2e]">{block.items.map((item, itemIndex) => <details key={itemIndex} className="border-b border-white/10 last:border-0"><summary className="cursor-pointer px-5 py-4 font-bold text-white">Q. {item.q}</summary><p className="px-5 pb-5 text-slate-300">{item.a}</p></details>)}</div></section>;
          case 'officialSources': {
            const agencies = block.agencyIds.map((id) => OFFICIAL_AGENCIES.find((agency) => agency.id === id)).filter((agency): agency is (typeof OFFICIAL_AGENCIES)[number] => Boolean(agency));
            if (!agencies.length) return null;
            return <section key={index} className="my-8 rounded-2xl border border-slate-200 p-6 dark:border-navy-700"><h2 className="mb-4 text-xl font-extrabold">공식 확인처</h2><ul className="space-y-3">{agencies.map((agency) => <li key={agency.id}><a href={agency.url} target="_blank" rel="noopener noreferrer" className="font-bold underline">{agency.name}</a><p className="text-sm text-slate-600 dark:text-slate-400">{agency.description}</p></li>)}</ul></section>;
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
