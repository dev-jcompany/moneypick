import NoticeEditorForm from '@/components/admin/NoticeEditorForm';
export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) { return <NoticeEditorForm noticeId={(await params).id} />; }
