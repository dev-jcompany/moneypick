// 위험한 CSS 속성 목록 (배경색·색상·레이아웃 깨짐 유발)
const STRIP_PROPS = new Set([
  'background', 'background-color', 'background-image', 'background-attachment',
  'background-position', 'background-repeat', 'background-size',
  'color',
  'font-family',
  'position', 'left', 'right', 'top', 'bottom', 'z-index',
  'float',
  'width', 'max-width', 'min-width',
  'height', 'max-height', 'min-height',
  'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
  'display',
  'visibility', 'opacity',
  'overflow', 'overflow-x', 'overflow-y',
]);

function cleanInlineStyle(styleAttr: string): string {
  const cleaned = styleAttr
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      const prop = s.split(':')[0]?.trim().toLowerCase() ?? '';
      return !STRIP_PROPS.has(prop);
    })
    .join('; ')
    .trim();
  return cleaned;
}

/**
 * 사용자가 붙여넣거나 저장한 HTML을 공개 페이지 렌더링 전에 정제.
 * - <style>, <script>, <link>, <iframe> 태그 제거
 * - 위험한 inline 스타일 제거
 * - on* 이벤트 핸들러 제거
 * - javascript: href 제거
 */
export function sanitizePostHtml(html: string): string {
  if (!html) return '';

  return html
    // 위험 태그 전체 제거
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<meta[^>]*/gi, '')
    // inline style 정제 (쌍따옴표)
    .replace(/style="([^"]*)"/gi, (_, styles: string) => {
      const cleaned = cleanInlineStyle(styles);
      return cleaned ? `style="${cleaned}"` : '';
    })
    // inline style 정제 (홑따옴표)
    .replace(/style='([^']*)'/gi, (_, styles: string) => {
      const cleaned = cleanInlineStyle(styles);
      return cleaned ? `style="${cleaned}"` : '';
    })
    // on* 이벤트 핸들러 제거
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    // javascript: 링크 제거
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, "href='#'");
}
