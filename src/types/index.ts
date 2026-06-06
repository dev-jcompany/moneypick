export interface Author {
  id: string;
  name: string;
  bio: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  authorId: string;
  summary: [string, string, string];
  content: string;
  thumbnail: string;
  metaDescription: string;
  status: 'published' | 'draft';
  sourceDate: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface Faq {
  id: string;
  postId: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Calculator {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  href: string;
}
