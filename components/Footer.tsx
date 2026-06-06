import Link from 'next/link';

const footerLinks = [
  { href: '/about', label: '회사소개' },
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/contact', label: '광고문의' },
  { href: '/contact', label: '제휴문의' },
  { href: '/disclaimer', label: '면책조항' },
];

const socialLinks = [
  { href: '#', label: '유튜브', icon: YoutubeIcon },
  { href: '#', label: '인스타그램', icon: InstagramIcon },
  { href: '#', label: '카카오채널', icon: KakaoIcon },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0D1928] text-white py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#21A05A] flex items-center justify-center shrink-0">
              <span className="text-white text-[15px] font-extrabold leading-none">M</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[17px] font-extrabold tracking-tight">머니픽</span>
              <span className="text-[10px] text-[#21A05A] font-semibold tracking-wider mt-0.5">MoneyPick</span>
            </div>
          </div>

          <nav aria-label="푸터 내비게이션">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {footerLinks.map((link, i) => (
                <li key={`${link.href}-${i}`}>
                  <Link href={link.href} className="text-[13px] text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-700/50">
          <div>
            <p className="text-[13px] text-slate-500">© {year} 머니픽(MoneyPick). All rights reserved.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">돈이 모이는 선택, 머니픽</p>
          </div>
          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-slate-700/60 hover:bg-[#21A05A] flex items-center justify-center transition-colors"
                >
                  <Icon />
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-[11px] text-slate-700 leading-relaxed">
          본 사이트의 모든 정보는 일반적인 참고 목적으로만 제공됩니다. 금융·세금·법률 관련 중요한 결정은
          반드시 자격을 갖춘 전문가와 상담하시기 바랍니다. 머니픽은 본 사이트 정보를 바탕으로 한 결정에
          대해 어떠한 법적 책임도 지지 않습니다.
        </p>
      </div>
    </footer>
  );
}

function YoutubeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function KakaoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7l-.9 3.4 4-2.6c.7.1 1.5.2 2.3.2 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
    </svg>
  );
}
