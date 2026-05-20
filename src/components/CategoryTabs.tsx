import type { Menu } from "../types";
import { CATS, categoryCount } from "../constants";

type CategoryTabsProps = {
  selected: string;
  onChange: (value: string) => void;
  menus: Menu[];
};

export default function CategoryTabs({ selected, onChange, menus }: CategoryTabsProps) {
  const counts = categoryCount(menus);

  return (
    <div className="flex flex-wrap gap-2">
      {CATS.map((cat) => {
        const active = cat === selected;

        return (
          <button
            type="button"
            key={cat}
            onClick={() => onChange(cat)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-mammoth-brand bg-mammoth-brand text-white"
                : "border-mammoth-line bg-white text-mammoth-sub hover:border-mammoth-brand hover:text-mammoth-ink"
            }`}
          >
            {cat}
            <span className="ml-1 text-[11px] opacity-70">{counts[cat] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
