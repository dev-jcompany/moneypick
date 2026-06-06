'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAdmin } from '@/components/admin/AdminStore';

export default function SubscribersPage() {
  const { subscribers, setSubscribers } = useAdmin();
  const [sort, setSort] = useState<'latest' | 'name'>('latest');
  const [query, setQuery] = useState('');
  const list = useMemo(() => [...subscribers].filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'latest' ? b.subscribedAt.localeCompare(a.subscribedAt) : a.name.localeCompare(b.name, 'ko')), [subscribers, query, sort]);
  const download = () => {
    const rows = list.map((item, index) => ({ 번호: index + 1, 이름: item.name, 이메일: item.email, 신청일: new Date(item.subscribedAt).toLocaleString('ko-KR'), 상태: item.status === 'active' ? '구독 중' : '구독 해지' }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 32 }, { wch: 22 }, { wch: 12 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, '뉴스레터 신청자');
    XLSX.writeFile(workbook, `머니픽_뉴스레터_신청자_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold">뉴스레터 신청자 관리</h2><p className="mt-1 text-sm text-slate-500">신청자 정보를 확인하고 메일 발송용 엑셀 파일로 내려받으세요.</p></div><button type="button" onClick={download} className="rounded-xl bg-[#107C41] px-5 py-3 text-sm font-bold text-white shadow-sm">▦ Excel 다운로드 (.xlsx)</button></div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-bold text-slate-500">전체 신청</p><strong className="mt-2 block text-3xl">{subscribers.length}</strong></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-bold text-slate-500">구독 중</p><strong className="mt-2 block text-3xl text-[#21A05A]">{subscribers.filter((item) => item.status === 'active').length}</strong></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-bold text-slate-500">구독 해지</p><strong className="mt-2 block text-3xl text-slate-400">{subscribers.filter((item) => item.status === 'unsubscribed').length}</strong></div></div>
      <section className="overflow-hidden rounded-3xl border border-[#E0E7E3] bg-white shadow-sm"><div className="flex flex-wrap gap-3 border-b border-[#E7ECE9] p-4"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 이메일 검색" className="min-w-[220px] flex-1 rounded-xl border border-[#DDE5E1] px-4 py-2.5 text-sm" /><select value={sort} onChange={(event) => setSort(event.target.value as 'latest' | 'name')} className="rounded-xl border border-[#DDE5E1] px-4 py-2.5 text-sm"><option value="latest">최신 신청순</option><option value="name">이름 가나다순</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F7F9F8] text-xs text-slate-500"><tr><th className="px-5 py-4">이름</th><th className="px-5 py-4">이메일</th><th className="px-5 py-4">신청일</th><th className="px-5 py-4">상태</th><th className="px-5 py-4 text-right">관리</th></tr></thead><tbody className="divide-y divide-[#EDF1EF]">{list.map((item) => <tr key={item.id}><td className="px-5 py-4 font-bold">{item.name}</td><td className="px-5 py-4 text-slate-600">{item.email}</td><td className="px-5 py-4 text-slate-500">{new Date(item.subscribedAt).toLocaleString('ko-KR')}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{item.status === 'active' ? '구독 중' : '구독 해지'}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setSubscribers((current) => current.map((subscriber) => subscriber.id === item.id ? { ...subscriber, status: subscriber.status === 'active' ? 'unsubscribed' : 'active' } : subscriber))} className="rounded-lg bg-[#F1F5F3] px-3 py-2 text-xs font-bold">{item.status === 'active' ? '구독 해지' : '다시 활성화'}</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
