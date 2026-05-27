import { useMemo, useState } from "react";
import CategoryTabs from "./components/CategoryTabs";
import DetailModal from "./components/DetailModal";
import LLMChat from "./components/LLMChat";
import MenuCard from "./components/MenuCard";
import QuizMode from "./components/QuizMode";
import SearchBar from "./components/SearchBar";
import { useMenus } from "./hooks/useMenus";
import type { Menu } from "./types";
import { renderStepLabel } from "./utils";

type Tab = "browser" | "quiz" | "chat";

const TABS: { id: Tab; label: string }[] = [
  { id: "browser", label: "메뉴 브라우저" },
  { id: "quiz", label: "퀴즈" },
  { id: "chat", label: "Q&A" },
];

function App() {
  const { menus, loading, error } = useMenus();
  const [tab, setTab] = useState<Tab>("browser");
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Menu | null>(null);

  const filtered = useMemo(
    () =>
      menus.filter((menu) => {
        if (cat !== "전체" && menu.cat !== cat) {
          return false;
        }

        if (q.trim() === "") {
          return true;
        }

        const term = q.trim().toLowerCase();
        return (
          menu.name.toLowerCase().includes(term) ||
          menu.variants.some((variant) =>
            variant.steps.some((step) => renderStepLabel(step).toLowerCase().includes(term)),
          )
        );
      }),
    [menus, cat, q],
  );

  const stats = useMemo(() => {
    const total = menus.length;
    const withR = menus.filter((menu) => menu.has_recipe).length;
    return { total, withR, pct: total ? Math.round((withR / total) * 100) : 0 };
  }, [menus]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mammoth-bg">
        <p className="text-mammoth-sub text-sm">메뉴 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mammoth-bg">
        <p className="text-mammoth-warn text-sm">데이터를 불러오지 못했어요: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mammoth-bg text-mammoth-ink">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <header className="mb-6">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-mammoth-brand sm:text-4xl">
              매머드 메뉴 학습
            </h1>
            <span className="text-sm text-mammoth-sub">익스프레스 · {stats.total}종</span>
          </div>
          <p className="mt-2 text-sm text-mammoth-sub">
            레시피 입력 {stats.withR}/{stats.total} ({stats.pct}%) · 나머지는 교육 때 채워주세요.
          </p>
        </header>

        <nav className="mb-8 flex gap-2 border-b border-mammoth-line pb-0">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`-mb-px rounded-t-lg border-x border-t px-5 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? "border-mammoth-line bg-white text-mammoth-brand"
                  : "border-transparent text-mammoth-sub hover:text-mammoth-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "browser" && (
          <div className="grid gap-4">
            <SearchBar value={q} onChange={setQ} />
            <CategoryTabs selected={cat} onChange={setCat} menus={menus} />
            <div className="text-sm text-mammoth-sub">{filtered.length}개 메뉴</div>

            <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {filtered.map((menu) => (
                <MenuCard key={menu.name} m={menu} onClick={setSel} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-3xl border border-mammoth-line bg-white p-9 text-center text-sm text-mammoth-sub">
                검색 결과가 없어요
              </div>
            )}
          </div>
        )}

        {tab === "quiz" && <QuizMode menus={menus} />}

        {tab === "chat" && <LLMChat menus={menus} />}
      </div>

      <DetailModal key={sel?.name ?? "detail-modal"} m={sel} onClose={() => setSel(null)} />
    </div>
  );
}

export default App;
