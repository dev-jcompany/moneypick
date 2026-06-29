// 머니픽 썸네일 자동 생성기
// 글유형별 3가지 SVG → PNG 변환 → Supabase Storage 업로드 → public URL 반환

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'article-images';

// ────────────────────────────────────────────────
// SVG 템플릿 - 글유형별 3개씩 (총 24개)
// 모두 220×220 단일 카드 형식, 배경색은 파라미터로 받음
// ────────────────────────────────────────────────

const COIN = (cx, cy, r=16, withW=true) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffd23f"/>
  <circle cx="${cx}" cy="${cy}" r="${r*0.7}" fill="#f0c020"/>
  ${withW ? `<text x="${cx}" y="${cy+r*0.3}" text-anchor="middle" font-size="${r*0.8}" fill="#7a5a00" font-weight="700">₩</text>` : ''}
`;

// 함정주의형
const TRAP_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="35" y="60" width="150" height="100" rx="12" fill="#fff"/>
<rect x="35" y="60" width="150" height="32" rx="12" fill="#e8e8e8"/>
<rect x="138" y="68" width="42" height="26" rx="13" fill="#fff" stroke="#ddd" stroke-width="2"/>
<circle cx="159" cy="81" r="8" fill="#ffd23f"/>
<rect x="48" y="105" width="80" height="6" rx="3" fill="#ddd"/>
<rect x="48" y="118" width="60" height="5" rx="2" fill="#ddd"/>
${COIN(56, 180, 18)}
${COIN(95, 184, 15, false)}
${COIN(140, 180, 18)}
<circle cx="170" cy="50" r="22" fill="#ff4444"/>
<text x="170" y="46" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">주의</text>
<rect x="166" y="49" width="8" height="12" rx="4" fill="#fff"/>
<rect x="166" y="63" width="8" height="6" rx="3" fill="#fff"/>
`;

const TRAP_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<circle cx="110" cy="110" r="55" fill="#2d2d2d"/>
<circle cx="110" cy="110" r="44" fill="#3d3d3d"/>
<path d="M110,55 C122,38 142,30 148,18" fill="none" stroke="#888" stroke-width="5" stroke-linecap="round"/>
<circle cx="150" cy="16" r="8" fill="#ff8800"/>
<path d="M90,88 L102,110 L86,122" fill="none" stroke="#ff4444" stroke-width="3" stroke-linecap="round"/>
<path d="M122,102 L132,118 L120,134" fill="none" stroke="#ff4444" stroke-width="2.5" stroke-linecap="round"/>
<text x="110" y="120" text-anchor="middle" font-size="36" fill="#ffd23f" font-weight="700">₩</text>
<rect x="0" y="180" width="220" height="30" fill="#ff4444" opacity="0.3"/>
`;

const TRAP_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<line x1="110" y1="20" x2="110" y2="75" stroke="#fff" stroke-width="2.5" opacity="0.6"/>
<path d="M110,75 C110,105 135,105 135,125 C135,148 110,153 104,135" fill="none" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/>
${COIN(104, 128, 22)}
<ellipse cx="50" cy="172" rx="22" ry="12" fill="#fff" opacity="0.3"/>
<polygon points="28,172 38,162 38,182" fill="#fff" opacity="0.3"/>
<ellipse cx="170" cy="180" rx="18" ry="10" fill="#fff" opacity="0.2"/>
<rect x="0" y="183" width="220" height="30" fill="${dark}"/>
<text x="110" y="203" text-anchor="middle" font-size="11" fill="#ffd23f" font-weight="700">이것만은 피하세요</text>
`;

// 개념정리형
const CONCEPT_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="35" y="50" width="105" height="125" rx="8" fill="#fff"/>
<rect x="35" y="50" width="15" height="125" rx="4" fill="#dbeafe"/>
<rect x="60" y="68" width="68" height="6" rx="3" fill="#ddd"/>
<rect x="60" y="80" width="52" height="5" rx="2" fill="#ddd"/>
<rect x="60" y="91" width="62" height="5" rx="2" fill="#ddd"/>
<rect x="60" y="102" width="44" height="5" rx="2" fill="#ddd"/>
<rect x="60" y="113" width="58" height="5" rx="2" fill="#ddd"/>
<rect x="60" y="124" width="48" height="5" rx="2" fill="#ddd"/>
<circle cx="166" cy="128" r="40" fill="none" stroke="#ffd23f" stroke-width="8"/>
<circle cx="166" cy="128" r="28" fill="${bg}" opacity="0.5"/>
<line x1="194" y1="156" x2="212" y2="178" stroke="#ffd23f" stroke-width="8" stroke-linecap="round"/>
<text x="166" y="135" text-anchor="middle" font-size="20" fill="#fff" font-weight="700">A</text>
`;

const CONCEPT_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<circle cx="110" cy="100" r="42" fill="#ffd23f"/>
<circle cx="110" cy="94" r="32" fill="#ffe066"/>
<path d="M96,92 C96,80 124,80 124,92" fill="none" stroke="#e8a000" stroke-width="3"/>
<rect x="98" y="138" width="24" height="7" rx="3" fill="#ffd23f"/>
<rect x="100" y="146" width="20" height="6" rx="3" fill="#e8c000"/>
<rect x="102" y="153" width="16" height="5" rx="2" fill="#d4a800"/>
<rect x="30" y="68" width="52" height="42" rx="5" fill="#fff" opacity="0.9" transform="rotate(-8 56 89)"/>
<rect x="36" y="76" width="36" height="5" rx="2" fill="#ddd" transform="rotate(-8 54 78)"/>
<rect x="36" y="86" width="28" height="4" rx="2" fill="#ddd" transform="rotate(-8 50 88)"/>
<rect x="138" y="72" width="52" height="42" rx="5" fill="#fff" opacity="0.9" transform="rotate(7 164 93)"/>
<rect x="146" y="80" width="36" height="5" rx="2" fill="#ddd" transform="rotate(7 164 82)"/>
<rect x="146" y="90" width="26" height="4" rx="2" fill="#ddd" transform="rotate(7 159 92)"/>
<line x1="110" y1="50" x2="110" y2="38" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
<line x1="72" y1="62" x2="62" y2="52" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
<line x1="148" y1="62" x2="158" y2="52" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
`;

const CONCEPT_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="68" y="35" width="100" height="135" rx="12" fill="#fff"/>
<rect x="68" y="35" width="100" height="38" rx="12" fill="#2d2d2d"/>
<text x="156" y="62" text-anchor="end" font-size="16" fill="#ffd23f" font-weight="700">₩43,200</text>
<rect x="78" y="83" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="102" y="83" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="126" y="83" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="150" y="83" width="14" height="16" rx="3" fill="#ffd23f"/>
<rect x="78" y="105" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="102" y="105" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="126" y="105" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="150" y="105" width="14" height="16" rx="3" fill="#ffd23f"/>
<rect x="78" y="127" width="42" height="16" rx="3" fill="#f0f0f0"/>
<rect x="126" y="127" width="18" height="16" rx="3" fill="#f0f0f0"/>
<rect x="150" y="127" width="14" height="16" rx="3" fill="#e05555"/>
${COIN(50, 142, 20)}
<text x="50" y="148" text-anchor="middle" font-size="14" fill="#7a5a00" font-weight="700">%</text>
`;

// 비교형
const COMPARE_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="132" y="58" width="8" height="108" rx="4" fill="#fff"/>
<rect x="92" y="166" width="80" height="10" rx="5" fill="#fff"/>
<rect x="102" y="176" width="60" height="6" rx="3" fill="#fff" opacity="0.7"/>
<rect x="68" y="64" width="128" height="6" rx="3" fill="#fff"/>
<line x1="80" y1="70" x2="68" y2="112" stroke="#fff" stroke-width="2.5"/>
<line x1="92" y1="70" x2="104" y2="112" stroke="#fff" stroke-width="2.5"/>
<ellipse cx="86" cy="116" rx="28" ry="8" fill="#fff" opacity="0.9"/>
${COIN(78, 102, 11)}
${COIN(95, 98, 11)}
<line x1="172" y1="70" x2="160" y2="100" stroke="#fff" stroke-width="2.5"/>
<line x1="184" y1="70" x2="196" y2="100" stroke="#fff" stroke-width="2.5"/>
<ellipse cx="178" cy="104" rx="28" ry="8" fill="#fff" opacity="0.7"/>
${COIN(178, 90, 11)}
`;

const COMPARE_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="28" y="58" width="110" height="68" rx="10" fill="${dark}"/>
<rect x="28" y="58" width="110" height="24" rx="10" fill="${dark}" opacity="0.7"/>
<rect x="38" y="66" width="44" height="8" rx="3" fill="#ffd23f"/>
<rect x="38" y="90" width="72" height="5" rx="2" fill="#fff" opacity="0.4"/>
<rect x="38" y="100" width="54" height="5" rx="2" fill="#fff" opacity="0.4"/>
<rect x="68" y="86" width="110" height="68" rx="10" fill="#fff"/>
<rect x="68" y="86" width="110" height="24" rx="10" fill="#ffd23f"/>
<text x="123" y="103" text-anchor="middle" font-size="10" fill="#7a5a00" font-weight="700">추천 상품</text>
<rect x="78" y="118" width="72" height="5" rx="2" fill="#ddd"/>
<rect x="78" y="128" width="54" height="5" rx="2" fill="#ddd"/>
<circle cx="165" cy="123" r="10" fill="${bg}"/>
<text x="165" y="128" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">✓</text>
<rect x="93" y="170" width="34" height="22" rx="11" fill="#ffd23f"/>
<text x="110" y="186" text-anchor="middle" font-size="12" fill="#7a5a00" font-weight="700">VS</text>
`;

const COMPARE_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="22" y="40" width="176" height="142" rx="10" fill="#fff" opacity="0.15"/>
<rect x="22" y="40" width="176" height="26" rx="10" fill="${dark}"/>
<text x="100" y="58" text-anchor="middle" font-size="10" fill="#ffd23f" font-weight="700">A상품</text>
<text x="160" y="58" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">B상품</text>
<rect x="130" y="40" width="1" height="26" fill="#fff" opacity="0.3"/>
<rect x="22" y="68" width="176" height="1" fill="#fff" opacity="0.3"/>
<text x="58" y="86" text-anchor="middle" font-size="10" fill="#fff" opacity="0.8">금리</text>
<text x="100" y="86" text-anchor="middle" font-size="13" fill="#ffd23f" font-weight="700">✓</text>
<text x="160" y="86" text-anchor="middle" font-size="13" fill="#fff" opacity="0.5">✗</text>
<rect x="22" y="93" width="176" height="1" fill="#fff" opacity="0.3"/>
<text x="58" y="110" text-anchor="middle" font-size="10" fill="#fff" opacity="0.8">한도</text>
<text x="100" y="110" text-anchor="middle" font-size="13" fill="#fff" opacity="0.5">✗</text>
<text x="160" y="110" text-anchor="middle" font-size="13" fill="#ffd23f" font-weight="700">✓</text>
<rect x="22" y="117" width="176" height="1" fill="#fff" opacity="0.3"/>
<text x="58" y="134" text-anchor="middle" font-size="10" fill="#fff" opacity="0.8">조건</text>
<text x="100" y="134" text-anchor="middle" font-size="13" fill="#ffd23f" font-weight="700">✓</text>
<text x="160" y="134" text-anchor="middle" font-size="13" fill="#ffd23f" font-weight="700">✓</text>
<rect x="22" y="141" width="176" height="1" fill="#fff" opacity="0.3"/>
<text x="58" y="158" text-anchor="middle" font-size="10" fill="#fff" opacity="0.8">속도</text>
<text x="100" y="158" text-anchor="middle" font-size="13" fill="#fff" opacity="0.5">✗</text>
<text x="160" y="158" text-anchor="middle" font-size="13" fill="#ffd23f" font-weight="700">✓</text>
<rect x="22" y="190" width="86" height="22" rx="11" fill="#ffd23f"/>
<text x="65" y="206" text-anchor="middle" font-size="10" fill="#7a5a00" font-weight="700">A가 유리!</text>
`;

// 하우투
const HOWTO_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<circle cx="58" cy="58" r="20" fill="#ffd23f"/>
<text x="58" y="66" text-anchor="middle" font-size="16" fill="#7a5a00" font-weight="700">1</text>
<rect x="86" y="50" width="100" height="16" rx="6" fill="#fff" opacity="0.8"/>
<line x1="58" y1="80" x2="58" y2="100" stroke="#fff" stroke-width="2.5" opacity="0.5" stroke-dasharray="4,4"/>
<circle cx="58" cy="108" r="20" fill="#ffd23f"/>
<text x="58" y="116" text-anchor="middle" font-size="16" fill="#7a5a00" font-weight="700">2</text>
<rect x="86" y="100" width="80" height="16" rx="6" fill="#fff" opacity="0.8"/>
<line x1="58" y1="130" x2="58" y2="150" stroke="#fff" stroke-width="2.5" opacity="0.5" stroke-dasharray="4,4"/>
<circle cx="58" cy="158" r="20" fill="#ffd23f"/>
<text x="58" y="166" text-anchor="middle" font-size="16" fill="#7a5a00" font-weight="700">3</text>
<rect x="86" y="150" width="90" height="16" rx="6" fill="#fff" opacity="0.8"/>
`;

const HOWTO_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="28" y="34" width="164" height="128" rx="10" fill="#fff" opacity="0.15"/>
<rect x="40" y="48" width="140" height="24" rx="6" fill="#ffd23f"/>
<text x="110" y="64" text-anchor="middle" font-size="11" fill="#7a5a00" font-weight="700">STEP 1 준비물</text>
<rect x="40" y="78" width="140" height="24" rx="6" fill="#fff" opacity="0.3"/>
<text x="110" y="94" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">STEP 2 신청</text>
<rect x="40" y="108" width="140" height="24" rx="6" fill="#fff" opacity="0.3"/>
<text x="110" y="124" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">STEP 3 심사</text>
<rect x="40" y="138" width="140" height="14" rx="6" fill="#fff" opacity="0.2"/>
<circle cx="180" cy="178" r="22" fill="#ffd23f"/>
<text x="180" y="174" text-anchor="middle" font-size="9" fill="#7a5a00" font-weight="700">완료</text>
<text x="180" y="188" text-anchor="middle" font-size="14" fill="#7a5a00" font-weight="700">✓</text>
`;

const HOWTO_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="28" y="40" width="164" height="120" rx="10" fill="#fff" opacity="0.15"/>
<rect x="40" y="54" width="22" height="22" rx="11" fill="#ffd23f"/>
<text x="51" y="71" text-anchor="middle" font-size="13" fill="#7a5a00" font-weight="700">1</text>
<rect x="68" y="60" width="90" height="10" rx="4" fill="#fff" opacity="0.8"/>
<rect x="40" y="84" width="22" height="22" rx="11" fill="#ffd23f"/>
<text x="51" y="101" text-anchor="middle" font-size="13" fill="#7a5a00" font-weight="700">2</text>
<rect x="68" y="90" width="70" height="10" rx="4" fill="#fff" opacity="0.8"/>
<rect x="40" y="114" width="22" height="22" rx="11" fill="#ffd23f"/>
<text x="51" y="131" text-anchor="middle" font-size="13" fill="#7a5a00" font-weight="700">3</text>
<rect x="68" y="120" width="80" height="10" rx="4" fill="#fff" opacity="0.8"/>
<rect x="28" y="174" width="164" height="26" rx="10" fill="#ffd23f"/>
<text x="110" y="192" text-anchor="middle" font-size="11" fill="#7a5a00" font-weight="700">신청 완료 체크리스트</text>
`;

// 완벽가이드형
const GUIDE_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<polygon points="110,38 50,82 170,82" fill="#fff"/>
<rect x="60" y="82" width="100" height="80" rx="5" fill="#fff"/>
<rect x="92" y="110" width="26" height="52" rx="3" fill="#dbeafe"/>
<rect x="68" y="92" width="20" height="20" rx="3" fill="#cce0ff"/>
<rect x="134" y="92" width="20" height="20" rx="3" fill="#cce0ff"/>
<rect x="142" y="20" width="14" height="28" rx="2" fill="#fff"/>
<circle cx="170" cy="76" r="24" fill="#ffd23f"/>
<polygon points="170,58 175,72 190,72 178,82 182,96 170,88 158,96 162,82 150,72 165,72" fill="#fff"/>
`;

const GUIDE_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="30" y="38" width="142" height="146" rx="10" fill="#fff"/>
<rect x="30" y="38" width="142" height="34" rx="10" fill="#ffd23f"/>
<text x="101" y="60" text-anchor="middle" font-size="12" fill="#7a5a00" font-weight="700">완벽 가이드</text>
<rect x="170" y="48" width="22" height="24" rx="3" fill="${dark}"/>
<rect x="170" y="74" width="22" height="24" rx="3" fill="${dark}"/>
<rect x="170" y="100" width="22" height="24" rx="3" fill="#ffd23f"/>
<rect x="170" y="126" width="22" height="24" rx="3" fill="${dark}"/>
<rect x="42" y="86" width="118" height="6" rx="3" fill="#ddd"/>
<rect x="42" y="98" width="92" height="5" rx="2" fill="#ddd"/>
<rect x="42" y="109" width="108" height="5" rx="2" fill="#ddd"/>
<rect x="42" y="120" width="78" height="5" rx="2" fill="#ddd"/>
<rect x="42" y="131" width="100" height="5" rx="2" fill="#ddd"/>
<rect x="42" y="142" width="86" height="5" rx="2" fill="#ddd"/>
<rect x="42" y="153" width="110" height="5" rx="2" fill="#ddd"/>
<rect x="42" y="164" width="72" height="5" rx="2" fill="#ddd"/>
`;

const GUIDE_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="70" y="50" width="80" height="68" rx="40" fill="#ffd23f"/>
<rect x="70" y="50" width="80" height="34" rx="17" fill="#ffe066"/>
<path d="M70,72 C50,68 44,86 56,102 C66,114 76,110 76,104" fill="none" stroke="#ffd23f" stroke-width="10" stroke-linecap="round"/>
<path d="M150,72 C170,68 176,86 164,102 C154,114 144,110 144,104" fill="none" stroke="#ffd23f" stroke-width="10" stroke-linecap="round"/>
<rect x="100" y="118" width="20" height="28" rx="4" fill="#ffd23f"/>
<rect x="82" y="142" width="56" height="14" rx="6" fill="#ffd23f"/>
<text x="110" y="98" text-anchor="middle" font-size="26" fill="#fff" font-weight="700">★</text>
${COIN(45, 170, 22)}
<text x="45" y="178" text-anchor="middle" font-size="14" fill="#7a5a00" font-weight="700">1</text>
${COIN(175, 170, 18, false)}
<text x="175" y="176" text-anchor="middle" font-size="12" fill="#7a5a00" font-weight="700">2</text>
`;

// 꿀팁
const TIP_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<circle cx="110" cy="98" r="48" fill="#ffd23f"/>
<circle cx="110" cy="90" r="36" fill="#ffe066"/>
<path d="M93,92 C93,76 127,76 127,92" fill="none" stroke="#e8a000" stroke-width="3.5"/>
<rect x="98" y="142" width="24" height="9" rx="4" fill="#ffd23f"/>
<rect x="100" y="151" width="20" height="7" rx="3" fill="#e8c000"/>
<rect x="102" y="158" width="16" height="6" rx="3" fill="#d4a800"/>
<line x1="110" y1="42" x2="110" y2="28" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
<line x1="68" y1="58" x2="56" y2="46" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
<line x1="152" y1="58" x2="164" y2="46" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
<line x1="54" y1="98" x2="40" y2="98" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
<line x1="166" y1="98" x2="180" y2="98" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
`;

const TIP_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="38" y="42" width="130" height="158" rx="10" fill="#fff"/>
<rect x="78" y="32" width="50" height="20" rx="10" fill="${dark}"/>
<rect x="86" y="38" width="34" height="10" rx="5" fill="#fff" opacity="0.4"/>
<circle cx="58" cy="76" r="14" fill="#ffd23f"/>
<text x="58" y="82" text-anchor="middle" font-size="13" fill="#7a5a00" font-weight="700">1</text>
<rect x="78" y="71" width="78" height="7" rx="3" fill="#ddd"/>
<rect x="78" y="82" width="60" height="5" rx="2" fill="#eee"/>
<circle cx="58" cy="116" r="14" fill="#ffd23f"/>
<text x="58" y="122" text-anchor="middle" font-size="13" fill="#7a5a00" font-weight="700">2</text>
<rect x="78" y="111" width="66" height="7" rx="3" fill="#ddd"/>
<rect x="78" y="122" width="52" height="5" rx="2" fill="#eee"/>
<circle cx="58" cy="156" r="14" fill="#ffd23f"/>
<text x="58" y="162" text-anchor="middle" font-size="13" fill="#7a5a00" font-weight="700">3</text>
<rect x="78" y="151" width="74" height="7" rx="3" fill="#ddd"/>
<rect x="78" y="162" width="56" height="5" rx="2" fill="#eee"/>
`;

const TIP_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="76" y="92" width="90" height="76" rx="12" fill="#fff"/>
<path d="M90,92 C90,56 152,56 152,92" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
<circle cx="121" cy="124" r="12" fill="${dark}"/>
<rect x="116" y="134" width="10" height="20" rx="3" fill="${dark}"/>
${COIN(40, 168, 20)}
${COIN(180, 168, 20)}
`;

// 트렌드·정책형
const TREND_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="22" y="50" width="108" height="120" rx="10" fill="#fff"/>
<rect x="22" y="50" width="108" height="30" rx="10" fill="${dark}"/>
<text x="76" y="70" text-anchor="middle" font-size="12" fill="#ffd23f" font-weight="700">2026. 01</text>
<rect x="32" y="90" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="50" y="90" width="14" height="14" rx="2" fill="#ffd23f"/>
<rect x="68" y="90" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="86" y="90" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="104" y="90" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="32" y="108" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="50" y="108" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="68" y="108" width="14" height="14" rx="2" fill="${dark}"/>
<rect x="86" y="108" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="104" y="108" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="32" y="126" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="50" y="126" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="68" y="126" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="86" y="126" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="104" y="126" width="14" height="14" rx="2" fill="#f0e0e0"/>
<rect x="138" y="70" width="44" height="30" rx="6" fill="#ffd23f"/>
<polygon points="182,66 208,52 208,118 182,104" fill="#ffd23f"/>
<rect x="144" y="100" width="10" height="22" rx="4" fill="#ffd23f"/>
<rect x="138" y="140" width="64" height="26" rx="13" fill="#ffd23f"/>
<text x="170" y="158" text-anchor="middle" font-size="11" fill="#7a5a00" font-weight="700">NEW 정책</text>
`;

const TREND_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="22" y="50" width="176" height="130" rx="10" fill="${dark}" opacity="0.5"/>
<line x1="22" y1="92" x2="198" y2="92" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
<line x1="22" y1="116" x2="198" y2="116" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
<line x1="22" y1="140" x2="198" y2="140" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
<rect x="34" y="138" width="22" height="42" rx="4" fill="#fff" opacity="0.4"/>
<rect x="62" y="122" width="22" height="58" rx="4" fill="#fff" opacity="0.4"/>
<rect x="90" y="106" width="22" height="74" rx="4" fill="#fff" opacity="0.5"/>
<rect x="118" y="86" width="22" height="94" rx="4" fill="#fff" opacity="0.6"/>
<rect x="146" y="68" width="22" height="112" rx="4" fill="#ffd23f"/>
<polyline points="45,134 73,118 101,102 129,82 157,62" fill="none" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="157" cy="62" r="7" fill="#ffd23f"/>
<rect x="138" y="188" width="62" height="22" rx="11" fill="#ffd23f"/>
<text x="169" y="203" text-anchor="middle" font-size="11" fill="#7a5a00" font-weight="700">+12.4%</text>
`;

const TREND_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="24" y="38" width="172" height="148" rx="10" fill="#fff"/>
<rect x="24" y="38" width="172" height="32" rx="10" fill="#e8e8e8"/>
<text x="110" y="60" text-anchor="middle" font-size="11" fill="#555" font-weight="700">오늘의 금융 뉴스</text>
<rect x="36" y="80" width="62" height="40" rx="4" fill="#f0f0f0"/>
<rect x="108" y="80" width="76" height="8" rx="3" fill="#ddd"/>
<rect x="108" y="93" width="58" height="6" rx="2" fill="#eee"/>
<rect x="108" y="103" width="68" height="6" rx="2" fill="#eee"/>
<rect x="108" y="113" width="50" height="6" rx="2" fill="#eee"/>
<rect x="36" y="128" width="148" height="6" rx="2" fill="#eee"/>
<rect x="36" y="140" width="120" height="6" rx="2" fill="#eee"/>
<rect x="36" y="152" width="130" height="6" rx="2" fill="#eee"/>
<rect x="32" y="190" width="54" height="22" rx="11" fill="#ffd23f"/>
<text x="59" y="205" text-anchor="middle" font-size="10" fill="#7a5a00" font-weight="700">2026</text>
<rect x="92" y="190" width="54" height="22" rx="11" fill="${dark}"/>
<text x="119" y="205" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">NEW</text>
`;

// 케이스·대상별형
const CASE_A = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<circle cx="110" cy="68" r="22" fill="#fff"/>
<rect x="88" y="90" width="44" height="36" rx="10" fill="#fff"/>
<line x1="110" y1="130" x2="110" y2="148" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round"/>
<line x1="110" y1="148" x2="62" y2="170" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round"/>
<line x1="110" y1="148" x2="158" y2="170" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round"/>
<rect x="28" y="170" width="68" height="36" rx="8" fill="#fff" opacity="0.9"/>
<text x="62" y="186" text-anchor="middle" font-size="10" fill="${dark}" font-weight="700">직장인</text>
<rect x="32" y="192" width="60" height="5" rx="2" fill="#ddd"/>
<rect x="124" y="170" width="68" height="36" rx="8" fill="#ffd23f"/>
<text x="158" y="186" text-anchor="middle" font-size="10" fill="#7a5a00" font-weight="700">프리랜서</text>
<rect x="128" y="192" width="60" height="5" rx="2" fill="#e8c000"/>
`;

const CASE_B = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<polygon points="68,80 30,108 106,108" fill="#fff" opacity="0.9"/>
<rect x="40" y="108" width="62" height="54" rx="4" fill="#fff" opacity="0.9"/>
<rect x="62" y="122" width="18" height="40" rx="3" fill="${bg}" opacity="0.5"/>
<rect x="42" y="116" width="14" height="14" rx="2" fill="#cce0ff"/>
<rect x="85" y="116" width="14" height="14" rx="2" fill="#cce0ff"/>
<rect x="118" y="64" width="74" height="98" rx="4" fill="#fff" opacity="0.7"/>
<rect x="124" y="74" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="142" y="74" width="14" height="12" rx="1" fill="#ffd23f"/>
<rect x="160" y="74" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="124" y="92" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="142" y="92" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="160" y="92" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="124" y="110" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="142" y="110" width="14" height="12" rx="1" fill="#ffd23f"/>
<rect x="160" y="110" width="14" height="12" rx="1" fill="#cce0ff"/>
<rect x="142" y="134" width="14" height="28" rx="2" fill="#cce0ff"/>
<rect x="100" y="130" width="24" height="18" rx="9" fill="#ffd23f"/>
<text x="112" y="143" text-anchor="middle" font-size="9" fill="#7a5a00" font-weight="700">VS</text>
`;

const CASE_C = (bg, dark) => `
<rect width="220" height="220" rx="22" fill="${bg}"/>
<rect x="56" y="68" width="108" height="86" rx="12" fill="#fff"/>
<rect x="80" y="58" width="60" height="22" rx="11" fill="none" stroke="#fff" stroke-width="6"/>
<rect x="56" y="86" width="108" height="8" fill="#e8e8e8"/>
<rect x="98" y="78" width="24" height="16" rx="4" fill="#ddd"/>
<circle cx="74" cy="116" r="10" fill="${bg}"/>
<text x="74" y="122" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">✓</text>
<rect x="90" y="111" width="60" height="6" rx="3" fill="#ddd"/>
<circle cx="74" cy="136" r="10" fill="${bg}"/>
<text x="74" y="142" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">✓</text>
<rect x="90" y="131" width="50" height="6" rx="3" fill="#ddd"/>
${COIN(50, 184, 22)}
${COIN(170, 184, 18, false)}
`;

// 카테고리별 색상 (배경, 어두운 액센트)
const COLORS = {
  '대출연구소':   ['#27ab63', '#1c7d48'],
  '부동산연구소': ['#3d8ef0', '#2a6fd4'],
  '세금연구소':   ['#e87d2a', '#c06010'],
  '직장인연구소': ['#7b5ea7', '#5a3f85'],
  '투자연구소':   ['#d94f6a', '#a83350'],
};

// 글유형별 템플릿 3개씩
const TEMPLATES = {
  '함정주의형':     [TRAP_A, TRAP_B, TRAP_C],
  '개념정리형':     [CONCEPT_A, CONCEPT_B, CONCEPT_C],
  '비교형':         [COMPARE_A, COMPARE_B, COMPARE_C],
  '하우투·절차형':  [HOWTO_A, HOWTO_B, HOWTO_C],
  '완벽가이드형':   [GUIDE_A, GUIDE_B, GUIDE_C],
  '꿀팁·리스트형':  [TIP_A, TIP_B, TIP_C],
  '트렌드·정책형':  [TREND_A, TREND_B, TREND_C],
  '케이스·대상별형':[CASE_A, CASE_B, CASE_C],
};

function buildSvg(category, archetype) {
  const [bg, dark] = COLORS[category] ?? COLORS['대출연구소'];
  const templates = TEMPLATES[archetype];
  if (!templates) return null;
  const tpl = templates[Math.floor(Math.random() * templates.length)];
  const inner = tpl(bg, dark);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 220 220">${inner}</svg>`;
}

/**
 * 글유형+카테고리 기반으로 썸네일 SVG를 만들고 PNG로 변환해 Supabase에 업로드.
 * @returns {Promise<string|null>} 업로드된 PNG의 public URL
 */
export async function generateThumbnail({ category, archetype, slug }) {
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('[thumbnail] Supabase 환경변수가 없어요. 썸네일 생성 건너뜀.');
    return null;
  }

  const svg = buildSvg(category, archetype);
  if (!svg) {
    console.warn(`[thumbnail] 글유형 매칭 실패: ${archetype}`);
    return null;
  }

  // SVG → PNG (600×600)
  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(600, 600)
    .png({ quality: 90 })
    .toBuffer();

  // Supabase Storage 업로드
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const filePath = `thumbnails/${slug}-${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, pngBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.warn(`[thumbnail] 업로드 실패: ${uploadError.message}`);
    return null;
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return publicUrlData?.publicUrl ?? null;
}
