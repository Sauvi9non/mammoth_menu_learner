import type { Menu } from "../types";
import { CATEGORY_COLORS } from "../constants";
import { tempLabel, tempStyleClasses } from "../utils";

type MenuCardProps = {
  m: Menu;
  onClick: (menu: Menu) => void;
};

export default function MenuCard({ m, onClick }: MenuCardProps) {
  const accent = CATEGORY_COLORS[m.cat as keyof typeof CATEGORY_COLORS] ?? "#D0C4B2";

  return (
    <button
      type="button"
      onClick={() => onClick(m)}
      className={`group flex w-full flex-col overflow-hidden rounded-[22px] border border-mammoth-line bg-white text-left transition duration-150 ${
        m.is_discontinuing ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      <div className="h-16" style={{ backgroundColor: accent, opacity: 0.14 }} />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-base font-bold leading-tight text-mammoth-ink">{m.name}</span>
          <span className="text-mammoth-sub">›</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {m.temps.map((temp, index) => {
            const [textClass, bgClass] = tempStyleClasses(temp);
            return (
              <span
                key={`${temp}-${index}`}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${textClass} ${bgClass}`}
              >
                {temp.includes("핫") || temp === "HOT ONLY" ? "🔥" : "❄️"}
                {tempLabel(temp)}
              </span>
            );
          })}

          {m.is_new && (
            <span className="inline-flex items-center gap-1 rounded-full bg-mammoth-newBg px-3 py-1 text-[11px] font-semibold text-mammoth-new">
              ✨ 신메뉴
            </span>
          )}

          {m.is_discontinuing && (
            <span className="inline-flex items-center gap-1 rounded-full bg-mammoth-discBg px-3 py-1 text-[11px] font-semibold text-mammoth-disc">
              ⏳ 단종
            </span>
          )}
        </div>

        <p className={`text-sm ${m.has_recipe ? (m.has_uncertain ? "text-mammoth-warn" : "text-mammoth-sub") : "text-[#B6A78F]"}`}>
          {m.has_recipe ? (m.has_uncertain ? "레시피 있음 · 확인필요" : "레시피 있음") : "레시피 미입력"}
        </p>
      </div>
    </button>
  );
}
