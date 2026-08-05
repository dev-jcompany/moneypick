import { getContactInquiries } from '@/lib/db';
import { CONTACT_INQUIRY_TYPES, type ContactInquiryType } from '@/lib/contact-inquiries';

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function typeLabel(type: string) {
  return CONTACT_INQUIRY_TYPES[type as ContactInquiryType] ?? type;
}

export default async function AdminInquiriesPage() {
  const { inquiries, error } = await getContactInquiries();

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1d1f]">문의함</h1>
          <p className="mt-1 text-sm text-[#66736c]">광고·제휴, 기사 제보, 오류 정정 문의를 최근 접수순으로 확인합니다.</p>
        </div>
        <span className="rounded-full bg-[#EFF7F2] px-3 py-1.5 text-[12px] font-bold text-[#17794A]">
          총 {inquiries.length.toLocaleString()}건
        </span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800">
          문의 내역을 불러오지 못했습니다. Supabase SQL Editor에서 문의 테이블 생성 SQL을 먼저 실행해주세요.
          <br />
          <span className="font-mono text-xs">{error}</span>
        </div>
      ) : null}

      {!error && inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d7dbd8] bg-white py-16 text-center text-[#9aa39c]">
          아직 접수된 문의가 없습니다.
        </div>
      ) : null}

      {inquiries.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[#e8ecef] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-[14px]">
              <thead className="border-b border-[#e8ecef] bg-[#f8fafa]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-[#555]">접수일</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">유형</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">제목</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">회신 이메일</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">내용</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-[#f1f3f1] align-top last:border-b-0 hover:bg-[#fafafa]">
                    <td className="whitespace-nowrap px-5 py-4 text-[13px] text-[#66736c]">{formatDate(inquiry.created_at)}</td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                        {typeLabel(inquiry.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#1a1d1f]">{inquiry.title}</p>
                      {inquiry.sender_name ? <p className="mt-1 text-[12px] text-[#9aa39c]">{inquiry.sender_name}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      <a href={`mailto:${inquiry.sender_email}`} className="font-semibold text-[#17794A] hover:underline">
                        {inquiry.sender_email}
                      </a>
                    </td>
                    <td className="max-w-[420px] px-4 py-4">
                      <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#3D454D]">{inquiry.message}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
