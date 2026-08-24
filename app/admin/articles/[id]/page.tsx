import { notFound } from 'next/navigation';
import ArticleEditorForm from '@/components/admin/ArticleEditorForm';
import { getMoneypickArticleByIdForAdmin } from '@/lib/db';

interface Props { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getMoneypickArticleByIdForAdmin(id);
  if (!article) notFound();
  return <ArticleEditorForm existing={article} />;
}
