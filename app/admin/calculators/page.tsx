'use client';

import { useAdmin } from '@/components/admin/AdminStore';
import { calculators } from '@/src/data/calculators';

export default function CalculatorSettingsPage() {
  const { calculatorSettings, setCalculatorSettings, calculatorOrder, setCalculatorOrder } = useAdmin();

  const move = (slug: string, direction: 'up' | 'down') => {
    setCalculatorOrder((current) => {
      const index = current.indexOf(slug);
      if (index < 0) return current;
      const next = [...current];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return current;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  const orderedCalcs = calculatorOrder.map((slug) => calculators.find((c) => c.slug === slug)).filter(Boolean) as typeof calculators;

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6"><h2 className="text-2xl font-extrabold">계산기 관리</h2><p className="mt-1 text-sm text-slate-500">홈페이지 노출 순서를 조정하고 계산식 변수를 설정하세요.</p></div>

      <section className="mb-8 rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-extrabold">홈페이지 노출 순서</h3>
        <p className="mb-5 text-sm text-slate-500">위아래 버튼으로 순서를 변경하면 메인 계산기 섹션에 반영됩니다.</p>
        <div className="space-y-2">
          {orderedCalcs.map((calc, index) => (
            <div key={calc.slug} className="flex items-center gap-4 rounded-2xl border border-[#E8ECEF] bg-[#F9FBFA] px-5 py-3.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#21A05A] text-sm font-extrabold text-white">{index + 1}</span>
              <span className="text-xl">{calc.icon}</span>
              <div className="flex-1">
                <p className="font-bold">{calc.name}</p>
                <p className="text-xs text-slate-400">{calc.category}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" disabled={index === 0} onClick={() => move(calc.slug, 'up')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#DDE5E1] text-slate-500 disabled:opacity-30 hover:border-[#21A05A] hover:text-[#21A05A]">▲</button>
                <button type="button" disabled={index === orderedCalcs.length - 1} onClick={() => move(calc.slug, 'down')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#DDE5E1] text-slate-500 disabled:opacity-30 hover:border-[#21A05A] hover:text-[#21A05A]">▼</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-extrabold">계산식 변수 설정</h3>
        <p className="mb-5 text-sm text-slate-500">정책과 세율이 바뀌면 해당 숫자를 수정하세요. 변경값은 자동 저장됩니다.</p>
        <div className="grid gap-5 lg:grid-cols-2">
          {Object.entries(calculatorSettings).map(([calculator, settings]) => (
            <section key={calculator} className="rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-lg font-extrabold">{calculator} 계산기</h4>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#17794A]">자동 저장</span>
              </div>
              <div className="space-y-4">
                {Object.entries(settings).map(([label, value]) => (
                  <label key={label} className="grid grid-cols-[1fr_130px] items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600">{label}</span>
                    <input
                      type="number"
                      step="0.001"
                      value={value}
                      onChange={(e) => setCalculatorSettings((current) => ({ ...current, [calculator]: { ...current[calculator], [label]: Number(e.target.value) } }))}
                      className="rounded-xl border border-[#DDE5E1] px-3 py-2.5 text-right font-bold outline-none focus:border-[#21A05A]"
                    />
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">운영 단계에서는 이 설정값을 데이터베이스에 저장하고 실제 계산식 API가 읽도록 연결해야 합니다.</p>
      </section>
    </div>
  );
}
