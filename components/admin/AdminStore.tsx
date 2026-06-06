'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { allPosts } from '@/src/data/posts';
import { categories as sourceCategories } from '@/src/data/categories';
import { notices as sourceNotices } from '@/src/data/notices';
import type { Category } from '@/src/types';
import type { AdminNotice, AdminPost, AdminTag, AdminUser, CalculatorSettings, MediaItem, NewsletterCampaign, SiteSettings, Subscriber } from '@/src/types/admin';

interface AdminState {
  posts: AdminPost[];
  categories: Category[];
  subscribers: Subscriber[];
  notices: AdminNotice[];
  calculatorSettings: CalculatorSettings;
  calculatorOrder: string[];
  users: AdminUser[];
  tags: AdminTag[];
  media: MediaItem[];
  siteSettings: SiteSettings;
  campaigns: NewsletterCampaign[];
  setPosts: React.Dispatch<React.SetStateAction<AdminPost[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  setNotices: React.Dispatch<React.SetStateAction<AdminNotice[]>>;
  setCalculatorSettings: React.Dispatch<React.SetStateAction<CalculatorSettings>>;
  setCalculatorOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  setTags: React.Dispatch<React.SetStateAction<AdminTag[]>>;
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  setCampaigns: React.Dispatch<React.SetStateAction<NewsletterCampaign[]>>;
}

const initialPosts: AdminPost[] = allPosts.map((post) => ({
  id: post.id,
  title: post.title,
  categoryId: post.categoryId,
  status: post.status,
  content: post.content || `<h2>${post.summary[0]}</h2><p>${post.metaDescription}</p>`,
  thumbnail: post.thumbnail,
  views: post.views,
  updatedAt: post.updatedAt,
}));

const initialSubscribers: Subscriber[] = [
  { id: '1', email: 'minji.kim@example.com', name: '김민지', subscribedAt: '2026-06-05T11:20:00+09:00', status: 'active' },
  { id: '2', email: 'seojun.lee@example.com', name: '이서준', subscribedAt: '2026-06-04T16:05:00+09:00', status: 'active' },
  { id: '3', email: 'jiwoo.park@example.com', name: '박지우', subscribedAt: '2026-06-03T09:42:00+09:00', status: 'active' },
  { id: '4', email: 'hyunwoo.choi@example.com', name: '최현우', subscribedAt: '2026-05-30T14:18:00+09:00', status: 'unsubscribed' },
  { id: '5', email: 'yuna.jung@example.com', name: '정유나', subscribedAt: '2026-05-29T18:31:00+09:00', status: 'active' },
];

const initialNotices: AdminNotice[] = sourceNotices.map((notice, index) => ({
  id: notice.id,
  title: notice.title,
  content: `<p>${notice.title}에 관한 안내입니다.</p>`,
  createdAt: notice.date,
  visible: index < 2,
}));

const initialSettings: CalculatorSettings = {
  '전세대출': { '보증금 대비 한도(%)': 80, '기본 금리(%)': 4 },
  DSR: { '목표 DSR(%)': 40, '스트레스 금리 가산(%p)': 1.5 },
  '중개수수료': { '매매 9억원 미만(%)': 0.4, '임대차 6억원 미만(%)': 0.3 },
  '실업급여': { '임금 대체율(%)': 60, '1일 상한액(원)': 66000, '1일 하한액(원)': 64192 },
  '연봉': { '국민연금 근로자율(%)': 4.5, '건강보험 근로자율(%)': 3.545, '고용보험 근로자율(%)': 0.9 },
  '자동차세': { '1000cc 이하(cc당 원)': 80, '1600cc 이하(cc당 원)': 140, '1600cc 초과(cc당 원)': 200, '지방교육세(%)': 30 },
};

const initialCalcOrder: string[] = ['jeonse-loan', 'dsr', 'brokerage-fee', 'unemployment-benefit', 'salary', 'car-tax'];

const initialUsers: AdminUser[] = [
  { id: '1', name: '머니픽 관리자', email: 'admin@moneypick.kr', role: '최고 관리자', status: '활성' },
  { id: '2', name: '콘텐츠 에디터', email: 'editor@moneypick.kr', role: '에디터', status: '초대 중' },
];

const initialTags: AdminTag[] = [
  { id: '1', name: '전세대출', slug: '전세대출', postCount: 3 },
  { id: '2', name: 'DSR', slug: 'dsr', postCount: 2 },
  { id: '3', name: '부동산', slug: '부동산', postCount: 4 },
  { id: '4', name: '절세', slug: '절세', postCount: 2 },
  { id: '5', name: '실업급여', slug: '실업급여', postCount: 1 },
  { id: '6', name: '연봉', slug: '연봉', postCount: 2 },
  { id: '7', name: '자동차세', slug: '자동차세', postCount: 1 },
];

const initialSiteSettings: SiteSettings = {
  siteName: '머니픽',
  tagline: '돈이 모이는 선택, 머니픽',
  description: '대출, 부동산, 세금, 투자까지 꼭 필요한 금융정보를 쉽고 정확하게 제공합니다.',
  contactEmail: 'hello@moneypick.kr',
  instagramUrl: '',
  youtubeUrl: '',
  kakaoUrl: '',
  ogImageUrl: '',
};

const initialCampaigns: NewsletterCampaign[] = [
  { id: '1', subject: '6월 금융 꿀팁 모음', content: '<p>안녕하세요, 머니픽입니다. 이번 달 꼭 알아야 할 금융 정보를 정리해 드립니다.</p>', status: 'sent', sentAt: '2026-06-01T10:00:00+09:00', recipientCount: 5 },
];

const AdminContext = createContext<AdminState | null>(null);
const storageKey = 'moneypick-admin-v1';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState(initialPosts);
  const [categories, setCategories] = useState(sourceCategories);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [notices, setNotices] = useState(initialNotices);
  const [calculatorSettings, setCalculatorSettings] = useState(initialSettings);
  const [calculatorOrder, setCalculatorOrder] = useState(initialCalcOrder);
  const [users, setUsers] = useState(initialUsers);
  const [tags, setTags] = useState(initialTags);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const data = JSON.parse(stored) as Partial<AdminState>;
          if (data.posts) setPosts(data.posts);
          if (data.categories) setCategories(data.categories);
          if (data.subscribers) setSubscribers(data.subscribers);
          if (data.notices) setNotices(data.notices);
          if (data.calculatorSettings) setCalculatorSettings(data.calculatorSettings);
          if (data.calculatorOrder) setCalculatorOrder(data.calculatorOrder);
          if (data.users) setUsers(data.users);
          if (data.tags) setTags(data.tags);
          if (data.media) setMedia(data.media);
          if (data.siteSettings) setSiteSettings(data.siteSettings);
          if (data.campaigns) setCampaigns(data.campaigns);
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify({ posts, categories, subscribers, notices, calculatorSettings, calculatorOrder, users, tags, media, siteSettings, campaigns }));
  }, [ready, posts, categories, subscribers, notices, calculatorSettings, calculatorOrder, users, tags, media, siteSettings, campaigns]);

  if (!ready) return <div className="min-h-screen bg-[#F4F7F6]" />;
  return (
    <AdminContext.Provider value={{ posts, categories, subscribers, notices, calculatorSettings, calculatorOrder, users, tags, media, siteSettings, campaigns, setPosts, setCategories, setSubscribers, setNotices, setCalculatorSettings, setCalculatorOrder, setUsers, setTags, setMedia, setSiteSettings, setCampaigns }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
