import { useState } from "react";
import type { Menu } from "../types";
import { isUncertainStep, renderStepLabel, tempLabel, tempStyleClasses } from "../utils";

type DetailModalProps = {
  m: Menu | null;
  onClose: () => void;
};

export default function DetailModal({ m, onClose }: DetailModalProps) {
  const [vIdx, setVIdx] = useState(0);

  if (!m) {
    return null;
  }

  const variant = m.variants[vIdx];
  const sizes = (variant.size || "").split("/").filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-mammoth-ink">{m.name}</h2>
            <p className="mt-1 text-sm text-mammoth-sub">{m.cat}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-mammoth-line bg-mammoth-bg p-2 text-mammoth-sub transition hover:border-mammoth-brand hover:text-mammoth-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {m.is_new && <span className="inline-flex items-center gap-1 rounded-full bg-mammoth-newBg px-3 py-1 text-[11px] font-semibold text-mammoth-new">✨ 신메뉴</span>}
          {m.is_discontinuing && <span className="inline-flex items-center gap-1 rounded-full bg-mammoth-discBg px-3 py-1 text-[11px] font-semibold text-mammoth-disc">⏳ 단종예정</span>}
        </div>

        {m.variants.length > 1 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mammoth-sub">온도 선택</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {m.variants.map((item, index) => {
                const active = index === vIdx;
                const [textClass, bgClass] = tempStyleClasses(item.temp);

                return (
                  <button
                    key={`${item.temp}-${index}`}
                    type="button"
                    onClick={() => setVIdx(index)}
                    className={`min-w-[106px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? `border-mammoth-brand ${bgClass} ${textClass}`
                        : "border-mammoth-line bg-white text-mammoth-sub hover:border-mammoth-brand"
                    }`}
                  >
                    {item.temp.includes("핫") || item.temp === "HOT ONLY" ? "🔥" : "❄️"} {tempLabel(item.temp)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mammoth-sub">사이즈</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.length ? (
              sizes.map((size) => (
                <span key={size} className="rounded-full border border-mammoth-line bg-mammoth-bg px-4 py-2 text-sm font-semibold text-mammoth-ink">
                  {size}
                </span>
              ))
            ) : (
              <span className="text-sm text-mammoth-sub">-</span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-mammoth-brand">제조 순서 {m.variants.length > 1 ? `(${tempLabel(variant.temp)})` : ""}</p>
          {variant.steps.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {variant.steps.map((step, index) => {
                const label = renderStepLabel(step);
                const uncertain = isUncertainStep(step);

                return (
                  <li key={`${label}-${index}`} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mammoth-brandSoft text-sm font-bold text-mammoth-brand">{index + 1}</span>
                    <p className={`text-sm leading-relaxed ${uncertain ? "text-mammoth-warn font-semibold" : "text-mammoth-ink"}`}>
                      {label}
                      {uncertain && <span className="ml-1 text-xs text-mammoth-warn">?</span>}
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#B6A78F] bg-[#F8F4E8] p-4 text-sm text-[#B6A78F]">
              아직 레시피가 입력되지 않았어요. 교육 때 확인하고 채워주세요.
            </p>
          )}
        </div>

        {variant.note && (
          <div className="mt-5 rounded-2xl bg-mammoth-warnBg px-4 py-3 text-sm text-[#7A5C18]">
            💡 {variant.note}
          </div>
        )}

        {variant.uncertain && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-mammoth-warnBg bg-mammoth-warnBg px-4 py-3 text-sm text-mammoth-warn">
            ⚠️ 물음표 항목은 교육 때 꼭 확인하세요
          </div>
        )}
      </div>
    </div>
  );
}
