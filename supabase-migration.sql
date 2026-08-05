-- 머니픽 Supabase 테이블 생성 (idempotent)

-- 1. 카테고리
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '📚',
  description TEXT DEFAULT '',
  color TEXT DEFAULT 'green',
  position INTEGER DEFAULT 0
);

-- 2. 태그
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0
);

-- 3. 포스트
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  content TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  meta_description TEXT DEFAULT '',
  tag_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 뉴스레터 구독자
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 뉴스레터 발송 이력
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 계산기 변수
CREATE TABLE IF NOT EXISTS calculator_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_name TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value FLOAT NOT NULL,
  UNIQUE (calculator_name, setting_key)
);

-- 8. 사이트 설정 (단일 행)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT '머니픽',
  tagline TEXT DEFAULT '돈이 모이는 선택, 머니픽',
  description TEXT DEFAULT '대출, 부동산, 세금, 투자까지 꼭 필요한 금융정보를 쉽고 정확하게 제공합니다.',
  contact_email TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  kakao_url TEXT DEFAULT '',
  og_image_url TEXT DEFAULT '',
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 9. 문의 접수
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('advertising_partnership', 'article_tip', 'correction', 'general')),
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  referer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "allow_all" ON categories;
DROP POLICY IF EXISTS "allow_all" ON tags;
DROP POLICY IF EXISTS "allow_all" ON posts;
DROP POLICY IF EXISTS "allow_all" ON notices;
DROP POLICY IF EXISTS "allow_all" ON subscribers;
DROP POLICY IF EXISTS "allow_all" ON newsletter_campaigns;
DROP POLICY IF EXISTS "allow_all" ON calculator_settings;
DROP POLICY IF EXISTS "allow_all" ON site_settings;
DROP POLICY IF EXISTS "categories public read" ON categories;
DROP POLICY IF EXISTS "tags public read" ON tags;
DROP POLICY IF EXISTS "published posts public read" ON posts;
DROP POLICY IF EXISTS "visible notices public read" ON notices;
DROP POLICY IF EXISTS "calculator settings public read" ON calculator_settings;
DROP POLICY IF EXISTS "site settings public read" ON site_settings;
DROP POLICY IF EXISTS "contact inquiries public insert" ON contact_inquiries;

CREATE POLICY "categories public read" ON categories
  FOR SELECT TO anon USING (true);
CREATE POLICY "tags public read" ON tags
  FOR SELECT TO anon USING (true);
CREATE POLICY "published posts public read" ON posts
  FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "visible notices public read" ON notices
  FOR SELECT TO anon USING (visible = true);
CREATE POLICY "calculator settings public read" ON calculator_settings
  FOR SELECT TO anon USING (true);
CREATE POLICY "site settings public read" ON site_settings
  FOR SELECT TO anon USING (true);
CREATE POLICY "contact inquiries public insert" ON contact_inquiries
  FOR INSERT TO anon
  WITH CHECK (
    type IN ('advertising_partnership', 'article_tip', 'correction', 'general')
    AND char_length(sender_email) BETWEEN 3 AND 160
    AND char_length(title) BETWEEN 2 AND 120
    AND char_length(message) BETWEEN 10 AND 3000
    AND status = 'new'
  );
