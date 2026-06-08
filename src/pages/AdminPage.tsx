import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { DbMenu, Menu } from "../types";

// ---------- supabase helpers ----------

const MENUS_QUERY = `
  id, name, status, is_popular,
  menu_categories!inner ( name ),
  base_recipes ( id, verified )
` as const;

async function fetchMenus(): Promise<Menu[]> {
  const { data, error } = await supabase
    .from("menus")
    .select(MENUS_QUERY)
    .order("name");
  if (error) throw new Error(error.message);

  return (data as unknown as DbMenu[]).map((raw) => {
    const base = raw.base_recipes?.[0] ?? null;
    return {
      id: raw.id,
      name: raw.name,
      cat: raw.menu_categories?.name ?? "",
      is_new: raw.status === "신메뉴",
      is_discontinuing: raw.status === "단종예정" || raw.status === "단종",
      variants: [],
      temps: [],
      has_recipe: false,
      has_uncertain: false,
      verified: base?.verified ?? false,
      base_recipe_id: base?.id ?? null,
    };
  });
}

async function deleteMenu(menuId: string) {
  await supabase.from("menus").delete().eq("id", menuId);
}

async function setVerified(baseRecipeId: string, verified: boolean) {
  await supabase
    .from("base_recipes")
    .update({ verified, verified_at: verified ? new Date().toISOString() : null })
    .eq("id", baseRecipeId);
}

// ---------- AdminPage ----------

export default function AdminPage() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "unverified">("all");
  const [cat, setCat] = useState("전체");

  async function loadMenus() {
    setDataLoading(true);
    try {
      setMenus(await fetchMenus());
      setLoaded(true);
    } finally {
      setDataLoading(false);
    }
  }

  async function toggleVerified(menu: Menu) {
    if (!menu.base_recipe_id) return;
    const next = !menu.verified;
    await setVerified(menu.base_recipe_id, next);
    setMenus((prev) =>
      prev.map((m) => (m.id === menu.id ? { ...m, verified: next } : m))
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mammoth-bg">
        <p className="text-sm text-mammoth-sub">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-mammoth-bg">
        <h1 className="text-2xl font-extrabold text-mammoth-brand">매머드 관리자</h1>
        <button
          type="button"
          onClick={() => void login()}
          className="rounded-full bg-mammoth-brand px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Google로 로그인
        </button>
      </div>
    );
  }

  const cats = ["전체", ...Array.from(new Set(menus.map((m) => m.cat)))];
  const verifiedCount = menus.filter((m) => m.verified).length;
  const shown = menus.filter((m) => {
    if (cat !== "전체" && m.cat !== cat) return false;
    if (filter === "unverified" && m.verified) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-mammoth-bg">
      <div className="mx-auto max-w-4xl px-5 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-mammoth-brand">관리자</h1>
            <p className="text-sm text-mammoth-sub mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-mammoth-sub hover:text-mammoth-ink transition">
              ← 앱으로
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-mammoth-line px-4 py-1.5 text-sm text-mammoth-sub hover:bg-white transition"
            >
              로그아웃
            </button>
          </div>
        </div>

        {!loaded ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <button
              type="button"
              onClick={() => void loadMenus()}
              disabled={dataLoading}
              className="rounded-full bg-mammoth-brand px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {dataLoading ? "불러오는 중..." : "메뉴 데이터 불러오기"}
            </button>
          </div>
        ) : (
          <>
            {/* 통계 */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bg-white border border-mammoth-line px-5 py-3">
                <p className="text-xs text-mammoth-sub">실측 확인</p>
                <p className="text-xl font-extrabold text-mammoth-brand">
                  {verifiedCount}{" "}
                  <span className="text-sm font-normal text-mammoth-sub">/ {menus.length}</span>
                </p>
              </div>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    filter === "all"
                      ? "bg-mammoth-brand text-white"
                      : "border border-mammoth-line text-mammoth-sub hover:bg-white"
                  }`}
                >
                  전체 {menus.length}
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unverified")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    filter === "unverified"
                      ? "bg-mammoth-brand text-white"
                      : "border border-mammoth-line text-mammoth-sub hover:bg-white"
                  }`}
                >
                  미확인 {menus.length - verifiedCount}
                </button>
                <button
                  type="button"
                  onClick={() => void loadMenus()}
                  className="rounded-full border border-mammoth-line px-4 py-1.5 text-sm text-mammoth-sub hover:bg-white transition"
                >
                  새로고침
                </button>
              </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="mb-3 flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    cat === c
                      ? "bg-mammoth-brand text-white"
                      : "border border-mammoth-line text-mammoth-sub hover:bg-white"
                  }`}
                >
                  {c} {c === "전체" ? menus.length : menus.filter((m) => m.cat === c).length}
                </button>
              ))}
            </div>

            {/* 메뉴 테이블 */}
            <div className="rounded-2xl border border-mammoth-line bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-mammoth-line bg-mammoth-bg">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-mammoth-sub">메뉴명</th>
                    <th className="px-3 py-3 text-left font-semibold text-mammoth-sub">카테고리</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">상태</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">실측</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((menu) => (
                    <tr
                      key={menu.id}
                      className="border-b border-mammoth-line last:border-0 hover:bg-mammoth-bg/40 transition"
                    >
                      <td className="px-4 py-3 font-medium text-mammoth-ink">{menu.name}</td>
                      <td className="px-3 py-3 text-mammoth-sub">{menu.cat}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          menu.is_new ? "bg-mammoth-newBg text-mammoth-new" :
                          menu.is_discontinuing ? "bg-mammoth-discBg text-mammoth-disc" :
                          "text-mammoth-sub"
                        }`}>
                          {menu.is_new ? "신메뉴" : menu.is_discontinuing ? "단종예정" : "상시"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => void toggleVerified(menu)}
                          disabled={!menu.base_recipe_id}
                          className={`rounded-full px-3 py-0.5 text-xs font-semibold transition ${
                            menu.verified
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : menu.base_recipe_id
                              ? "bg-mammoth-warnBg text-mammoth-warn hover:bg-mammoth-warnBg/80"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {menu.verified ? "확인" : menu.base_recipe_id ? "미확인" : "레시피없음"}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) return;
                            await deleteMenu(menu.id);
                            setMenus((prev) => prev.filter((m) => m.id !== menu.id));
                          }}
                          className="rounded-full border border-red-200 px-3 py-0.5 text-xs text-red-500 hover:bg-red-50 transition"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
