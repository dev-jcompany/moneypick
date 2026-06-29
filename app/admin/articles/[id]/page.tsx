import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ArticleEditorForm from '@/components/admin/ArticleEditorForm';
import type { MoneypickArticleRow } from '@/components/moneypick/types';

async function getArticle(id: string): Promise<MoneypickArticleRow | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from('moneypick_articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as MoneypickArticleRow) ?? null;
}

interface Props { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();
  return <ArticleEditorForm existing={article} />;
}
