import { useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Menu, Variant } from "../types";

// ---------- helpers ----------

async function fetchMenus(): Promise<Menu[]> {
  const snap = await getDocs(collection(db, "menus"));
  const data = snap.docs.map((d) => d.data() as Menu);
  data.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return data;
}

async function saveMenu(menu: Menu) {
  await updateDoc(doc(db, "menus", menu.name), {
    variants: menu.variants,
    has_recipe: menu.variants.some((v) => v.steps.length > 0),
    has_uncertain: menu.variants.some((v) => v.uncertain),
    verified: menu.verified ?? false,
    updated_at: new Date().toISOString(),
  });
}

// ---------- EditModal ----------

function EditModal({
  menu,
  onClose,
  onSaved,
}: {
  menu: Menu;
  onClose: () => void;
  onSaved: (updated: Menu) => void;
}) {
  const [draft, setDraft] = useState<Menu>(JSON.parse(JSON.stringify(menu)));
  const [saving, setSaving] = useState(false);

  function setSteps(variantIndex: number, raw: string) {
    const steps = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    setDraft((prev) => {
      const variants = prev.variants.map((v, i) =>
        i === variantIndex ? { ...v, steps } : v
      );
      return { ...prev, variants };
    });
  }

  function setNote(variantIndex: number, note: string) {
    setDraft((prev) => {
      const variants = prev.variants.map((v, i) =>
        i === variantIndex ? { ...v, note: note || null } : v
      );
      return { ...prev, variants };
    });
  }

  function setUncertain(variantIndex: number, uncertain: boolean) {
    setDraft((prev) => {
      const variants = prev.variants.map((v, i) =>
        i === variantIndex ? { ...v, uncertain } : v
      );
      return { ...prev, variants };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveMenu(draft);
      onSaved(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-mammoth-ink">{draft.name}</h2>
            <span className="text-sm text-mammoth-sub">{draft.cat}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-mammoth-ink cursor-pointer">
              <input
                type="checkbox"
                checked={draft.verified ?? false}
                onChange={(e) => setDraft((p) => ({ ...p, verified: e.target.checked }))}
                className="rounded"
              />
              실측 확인 완료
            </label>
          </div>
        </div>

        <div className="space-y-5">
          {draft.variants.map((v: Variant, i: number) => (
            <div key={`${v.temp}-${i}`} className="rounded-xl border border-mammoth-line p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-mammoth-ink text-sm">
                  {v.temp} · {v.size}
                </span>
                <label className="flex items-center gap-1 text-xs text-mammoth-sub cursor-pointer">
                  <input
                    type="checkbox"
                    checked={v.uncertain}
                    onChange={(e) => setUncertain(i, e.target.checked)}
                  />
                  불확실 항목 포함
                </label>
              </div>
              <p className="text-xs text-mammoth-sub mb-1">제조 순서 (한 줄에 재료 하나)</p>
              <textarea
                rows={Math.max(3, v.steps.length + 1)}
                value={(v.steps as string[]).join("\n")}
                onChange={(e) => setSteps(i, e.target.value)}
                placeholder="예: 얼음&#10;우유&#10;에스프레소 샷"
                className="w-full rounded-lg border border-mammoth-line px-3 py-2 text-sm font-mono text-mammoth-ink outline-none focus:border-mammoth-brand resize-none"
              />
              <input
                type="text"
                value={v.note ?? ""}
                onChange={(e) => setNote(i, e.target.value)}
                placeholder="특이사항 (선택)"
                className="mt-2 w-full rounded-lg border border-mammoth-line px-3 py-2 text-sm text-mammoth-ink outline-none focus:border-mammoth-brand"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-mammoth-line px-5 py-2 text-sm font-semibold text-mammoth-sub hover:bg-mammoth-bg transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-full bg-mammoth-brand px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- AdminPage ----------

export default function AdminPage() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [filter, setFilter] = useState<"all" | "unverified">("all");

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
    const updated = { ...menu, verified: !menu.verified };
    await saveMenu(updated);
    setMenus((prev) => prev.map((m) => (m.name === menu.name ? updated : m)));
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

  const verified = menus.filter((m) => m.verified).length;
  const shown = filter === "all" ? menus : menus.filter((m) => !m.verified);

  return (
    <div className="min-h-screen bg-mammoth-bg">
      <div className="mx-auto max-w-4xl px-5 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-mammoth-brand">관리자</h1>
            <p className="text-sm text-mammoth-sub mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-mammoth-sub hover:text-mammoth-ink transition"
            >
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

        {/* Load data */}
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
            {/* Stats */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bg-white border border-mammoth-line px-5 py-3">
                <p className="text-xs text-mammoth-sub">실측 확인</p>
                <p className="text-xl font-extrabold text-mammoth-brand">
                  {verified} <span className="text-sm font-normal text-mammoth-sub">/ {menus.length}</span>
                </p>
              </div>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === "all" ? "bg-mammoth-brand text-white" : "border border-mammoth-line text-mammoth-sub hover:bg-white"}`}
                >
                  전체 {menus.length}
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unverified")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === "unverified" ? "bg-mammoth-brand text-white" : "border border-mammoth-line text-mammoth-sub hover:bg-white"}`}
                >
                  미확인 {menus.length - verified}
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

            {/* Menu table */}
            <div className="rounded-2xl border border-mammoth-line bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-mammoth-line bg-mammoth-bg">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-mammoth-sub">메뉴명</th>
                    <th className="px-3 py-3 text-left font-semibold text-mammoth-sub">카테고리</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">레시피</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">실측</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">편집</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((menu) => (
                    <tr key={menu.name} className="border-b border-mammoth-line last:border-0 hover:bg-mammoth-bg/40 transition">
                      <td className="px-4 py-3 font-medium text-mammoth-ink">{menu.name}</td>
                      <td className="px-3 py-3 text-mammoth-sub">{menu.cat}</td>
                      <td className="px-3 py-3 text-center">
                        {menu.has_recipe ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : (
                          <span className="text-mammoth-sub">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => void toggleVerified(menu)}
                          className={`rounded-full px-3 py-0.5 text-xs font-semibold transition ${
                            menu.verified
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-mammoth-warnBg text-mammoth-warn hover:bg-mammoth-warnBg/80"
                          }`}
                        >
                          {menu.verified ? "확인" : "미확인"}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setEditing(menu)}
                          className="rounded-full border border-mammoth-line px-3 py-0.5 text-xs text-mammoth-sub hover:text-mammoth-ink hover:bg-mammoth-bg transition"
                        >
                          편집
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

      {editing && (
        <EditModal
          menu={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setMenus((prev) => prev.map((m) => (m.name === updated.name ? updated : m)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
