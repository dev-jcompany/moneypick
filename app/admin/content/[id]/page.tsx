import ContentEditorForm from '@/components/admin/ContentEditorForm';
export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) { return <ContentEditorForm postId={(await params).id} />; }
