export interface AdminPost {
  id: string;
  title: string;
  categoryId: string;
  status: 'published' | 'draft';
  content: string;
  thumbnail: string;
  views: number;
  updatedAt: string;
  tagIds?: string[];
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface AdminNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  visible: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: '최고 관리자' | '에디터';
  status: '활성' | '초대 중';
}

export type CalculatorSettings = Record<string, Record<string, number>>;

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface MediaItem {
  id: string;
  filename: string;
  dataUrl: string;
  size: number;
  uploadedAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  kakaoUrl: string;
  ogImageUrl: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent';
  sentAt: string;
  recipientCount: number;
}
