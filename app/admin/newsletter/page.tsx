'use client';

import { useMemo, useState } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAdmin } from '@/components/admin/AdminStore';

export default function NewsletterPage() {
  const { subscribers, campaigns, setCampaigns } = useAdmin();
  const [tab, setTab] = useState<'compose' | 'history'>('compose');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const activeCount = useMemo(() => subscribers.filter((s) => s.status === 'active').length, [subscribers]);

  const send = () => {
    if (!subject.trim()) return window.alert('제목을 입력해 주세요.');
    if (!content.replace(/<[^>]*>/g, '').trim()) return window.alert('내용을 입력해 주세요.');
    if (!window.confirm(`활성 구독자 ${activeCount}명에게 발송할까요?`)) return;
    setCampaigns((current) => [{ id: crypto.randomUUID(), subject: subject.trim(), content, status: 'sent', sentAt: new Date().toISOString(), recipientCount: activeCount }, ...current]);
    setSubject('');
    setContent('');
    setTab('history');
    window.alert('발송이 완료되었습니다.');
  };

  const saveDraft = () => {
    if (!subject.trim()) return window.alert('제목을 입력해 주세요.');
    setCampaigns((current) => [{ id: crypto.randomUUID(), subject: subject.trim(), content, status: 'draft', sentAt: '', recipientCount: 0 }, ...current]);
    setSubject('');
    setContent('');
    window.alert('임시저장했습니다.');
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold">뉴스레터 발송 관리</h2><p className="mt-1 text-sm text-slate-500">구독자에게 보낼 뉴스레터를 작성하고 발송 이력을 확인하세요.</p></div>
        <div className="flex gap-2 rounded-2xl bg-[#F1F5F3] p-1">
          <button type="button" onClick={() => setTab('compose')} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${tab === 'compose' ? 'bg-white text-[#17794A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>✎ 새 발송</button>
          <button type="button" onClick={() => setTab('history')} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${tab === 'history' ? 'bg-white text-[#17794A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>발송 이력 ({campaigns.filter((c) => c.status === 'sent').length})</button>
        </div>
      </div>

      {tab === 'compose' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">메일 제목</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="예: 6월 금리 변동 요약 + 절세 꿀팁" className="w-full rounded-2xl border border-[#DDE5E1] px-5 py-4 text-lg font-bold outline-none focus:border-[#21A05A]" />
              </label>
            </section>
            <section className="rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
              <span className="mb-3 block text-sm font-bold">본문</span>
              <RichTextEditor value={content} onChange={setContent} placeholder="구독자에게 전달할 내용을 작성하세요." />
            </section>
          </div>
          <aside className="space-y-5">
            <section className="rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-extrabold">발송 요약</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">활성 구독자</span><strong className="text-[#21A05A]">{activeCount}명</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">총 발송 횟수</span><strong>{campaigns.filter((c) => c.status === 'sent').length}회</strong></div>
              </div>
              <div className="mt-5 space-y-2">
                <button type="button" onClick={send} className="w-full rounded-xl bg-[#21A05A] py-3 font-bold text-white hover:bg-[#17794A]">지금 발송하기 →</button>
                <button type="button" onClick={saveDraft} className="w-full rounded-xl border border-[#CFD9D4] bg-white py-3 text-sm font-bold hover:bg-[#F7F9F8]">임시저장</button>
              </div>
            </section>
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-800">
              실제 배포 시 SendGrid·Resend 등 이메일 발송 API와 연결해야 합니다. 현재는 발송 이력만 저장됩니다.
            </section>
          </aside>
        </div>
      )}

      {tab === 'history' && (
        <section className="overflow-hidden rounded-3xl border border-[#E0E7E3] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F9F8] text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">제목</th>
                <th className="px-5 py-4 text-right">발송 대상</th>
                <th className="px-5 py-4">상태</th>
                <th className="px-5 py-4">발송일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1EF]">
              {campaigns.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">발송 이력이 없습니다.</td></tr>}
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-[#FAFBFA]">
                  <td className="px-5 py-4 font-bold">{campaign.subject}</td>
                  <td className="px-5 py-4 text-right">{campaign.recipientCount > 0 ? `${campaign.recipientCount}명` : '-'}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{campaign.status === 'sent' ? '발송 완료' : '임시저장'}</span></td>
                  <td className="px-5 py-4 text-slate-500">{campaign.sentAt ? new Date(campaign.sentAt).toLocaleString('ko-KR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
