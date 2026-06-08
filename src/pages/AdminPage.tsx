import { useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Menu, Variant, StepItem } from "../types";

// ---------- firebase helpers ----------

async function fetchMenus(): Promise<Menu[]> {
  const snap = await getDocs(collection(db, "menus"));
  const data = snap.docs.map((d) => d.data() as Menu);
  data.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return data;
}

async function deleteMenu(menuName: string) {
  await deleteDoc(doc(db, "menus", menuName));
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

// ---------- edit state types ----------

type EditStep = {
  id: string;
  type: "ingredient" | "action";
  item: string;
  amount: string; // free text: "C선까지", "우유선까지", "1샷" …
};

type EditVariant = {
  key: string; // `${temp}__${size}`
  temp: string;
  size: string;
  steps: EditStep[];
  uncertain: boolean;
  note: string;
};

// ---------- conversions ----------

function toEditVariants(variants: Variant[]): EditVariant[] {
  return variants.map((v) => ({
    key: `${v.temp}__${v.size}`,
    temp: v.temp,
    size: v.size,
    steps: v.steps.map((step): EditStep => {
      if (typeof step === "string") {
        return { id: crypto.randomUUID(), type: "ingredient", item: step, amount: "" };
      }
      return {
        id: crypto.randomUUID(),
        type: "ingredient",
        item: step.item,
        amount: step.amount ?? "",
      };
    }),
    uncertain: v.uncertain,
    note: v.note ?? "",
  }));
}

function fromEditVariants(editVariants: EditVariant[], original: Variant[]): Variant[] {
  return editVariants.map((ev) => {
    const orig = original.find((v) => v.temp === ev.temp && v.size === ev.size)!;
    const steps: StepItem[] = ev.steps
      .filter((s) => s.item.trim())
      .map((s): StepItem => {
        if (s.type === "action") return s.item;
        if (s.amount.trim()) return { item: s.item, amount: s.amount };
        return s.item;
      });
    return { ...orig, steps, uncertain: ev.uncertain, note: ev.note || null };
  });
}

// S → M → L 등 일반적인 사이즈 순서 정렬
const SIZE_ORDER = ["S", "M", "L", "스몰", "미디엄", "라지", "레귤러", "S/M/L"];
function sortedSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b, "ko");
  });
}

// ---------- VariantEditor ----------

function VariantEditor({
  variant,
  onUpdateStep,
  onAddStep,
  onRemoveStep,
  onMoveStep,
  onUpdateVariant,
}: {
  variant: EditVariant;
  onUpdateStep: (stepId: string, field: Partial<Pick<EditStep, "type" | "item" | "amount">>) => void;
  onAddStep: (type: "ingredient" | "action") => void;
  onRemoveStep: (stepId: string) => void;
  onMoveStep: (stepId: string, dir: -1 | 1) => void;
  onUpdateVariant: (field: Partial<Pick<EditVariant, "uncertain" | "note">>) => void;
}) {
  return (
    <div className="p-4">
      {/* 온도 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-mammoth-ink bg-mammoth-bg rounded-full px-3 py-0.5 border border-mammoth-line">
          {variant.temp}
        </span>
        <label className="flex items-center gap-1.5 text-xs text-mammoth-sub cursor-pointer">
          <input
            type="checkbox"
            checked={variant.uncertain}
            onChange={(e) => onUpdateVariant({ uncertain: e.target.checked })}
          />
          불확실 항목 포함
        </label>
      </div>

      {/* 스텝 목록 */}
      <div className="rounded-lg border border-mammoth-line overflow-hidden mb-3">
        {variant.steps.length === 0 ? (
          <p className="text-center text-xs text-mammoth-sub py-5">
            아래 버튼으로 재료 또는 행동을 추가하세요
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-mammoth-bg/60 border-b border-mammoth-line">
              <tr>
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-mammoth-sub w-10">
                  순서
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold text-mammoth-sub w-14">
                  구분
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-semibold text-mammoth-sub">
                  재료 / 행동
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold text-mammoth-sub w-36">
                  양
                </th>
                <th className="w-7" />
              </tr>
            </thead>
            <tbody>
              {variant.steps.map((step, si) => (
                <tr
                  key={step.id}
                  className="border-b border-mammoth-line last:border-0 hover:bg-mammoth-bg/20"
                >
                  {/* 순서 이동 */}
                  <td className="px-2 py-1.5">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onMoveStep(step.id, -1)}
                        disabled={si === 0}
                        className="text-mammoth-sub hover:text-mammoth-ink disabled:opacity-20 text-xs leading-none"
                      >
                        ▲
                      </button>
                      <span className="text-xs text-mammoth-sub">{si + 1}</span>
                      <button
                        type="button"
                        onClick={() => onMoveStep(step.id, 1)}
                        disabled={si === variant.steps.length - 1}
                        className="text-mammoth-sub hover:text-mammoth-ink disabled:opacity-20 text-xs leading-none"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* 재료/행동 토글 */}
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateStep(step.id, {
                          type: step.type === "ingredient" ? "action" : "ingredient",
                        })
                      }
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold transition whitespace-nowrap ${
                        step.type === "ingredient"
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                      }`}
                    >
                      {step.type === "ingredient" ? "재료" : "행동"}
                    </button>
                  </td>

                  {/* 재료명 / 행동명 */}
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={step.item}
                      onChange={(e) => onUpdateStep(step.id, { item: e.target.value })}
                      placeholder={
                        step.type === "ingredient" ? "재료명 (예: 우유)" : "행동 (예: 젓기, 블렌더로 갈기)"
                      }
                      className="w-full rounded border border-mammoth-line px-2 py-1 text-sm text-mammoth-ink outline-none focus:border-mammoth-brand"
                    />
                  </td>

                  {/* 양 (재료만) */}
                  <td className="px-2 py-1.5">
                    {step.type === "ingredient" ? (
                      <input
                        type="text"
                        value={step.amount}
                        onChange={(e) => onUpdateStep(step.id, { amount: e.target.value })}
                        placeholder="예: C선까지"
                        className="w-full rounded border border-mammoth-line px-2 py-1 text-sm text-mammoth-ink outline-none focus:border-mammoth-brand"
                      />
                    ) : (
                      <span className="text-mammoth-sub text-xs px-2">—</span>
                    )}
                  </td>

                  {/* 삭제 */}
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => onRemoveStep(step.id)}
                      className="text-mammoth-sub hover:text-red-500 transition text-sm leading-none"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 추가 버튼 */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => onAddStep("ingredient")}
          className="rounded-full border border-mammoth-line px-3 py-1 text-xs font-semibold text-mammoth-sub hover:text-mammoth-ink hover:bg-mammoth-bg transition"
        >
          + 재료 추가
        </button>
        <button
          type="button"
          onClick={() => onAddStep("action")}
          className="rounded-full border border-mammoth-line px-3 py-1 text-xs font-semibold text-mammoth-sub hover:text-mammoth-ink hover:bg-mammoth-bg transition"
        >
          + 행동 추가
        </button>
      </div>

      {/* 특이사항 */}
      <input
        type="text"
        value={variant.note}
        onChange={(e) => onUpdateVariant({ note: e.target.value })}
        placeholder="특이사항 (선택)"
        className="w-full rounded-lg border border-mammoth-line px-3 py-1.5 text-xs text-mammoth-ink outline-none focus:border-mammoth-brand"
      />
    </div>
  );
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
  const [variants, setVariants] = useState<EditVariant[]>(() => toEditVariants(menu.variants));
  const [verified, setVerified] = useState(menu.verified ?? false);
  const [saving, setSaving] = useState(false);

  function updateStep(vKey: string, stepId: string, field: Partial<Pick<EditStep, "type" | "item" | "amount">>) {
    setVariants((prev) =>
      prev.map((v) =>
        v.key !== vKey
          ? v
          : { ...v, steps: v.steps.map((s) => (s.id === stepId ? { ...s, ...field } : s)) }
      )
    );
  }

  function addStep(vKey: string, type: "ingredient" | "action") {
    setVariants((prev) =>
      prev.map((v) =>
        v.key !== vKey
          ? v
          : {
              ...v,
              steps: [...v.steps, { id: crypto.randomUUID(), type, item: "", amount: "" }],
            }
      )
    );
  }

  function removeStep(vKey: string, stepId: string) {
    setVariants((prev) =>
      prev.map((v) =>
        v.key !== vKey ? v : { ...v, steps: v.steps.filter((s) => s.id !== stepId) }
      )
    );
  }

  function moveStep(vKey: string, stepId: string, dir: -1 | 1) {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.key !== vKey) return v;
        const steps = [...v.steps];
        const i = steps.findIndex((s) => s.id === stepId);
        const j = i + dir;
        if (j < 0 || j >= steps.length) return v;
        [steps[i], steps[j]] = [steps[j], steps[i]];
        return { ...v, steps };
      })
    );
  }

  function updateVariant(vKey: string, field: Partial<Pick<EditVariant, "uncertain" | "note">>) {
    setVariants((prev) => prev.map((v) => (v.key !== vKey ? v : { ...v, ...field })));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updatedVariants = fromEditVariants(variants, menu.variants);
      const updated: Menu = { ...menu, variants: updatedVariants, verified };
      await saveMenu(updated);
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  // 사이즈 탭
  const uniqueSizes = sortedSizes([...new Set(variants.map((v) => v.size))]);
  const [selectedSize, setSelectedSize] = useState<string>(() => uniqueSizes[0] ?? "");
  const selectedVariants = variants.filter((v) => v.size === selectedSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-mammoth-ink">{menu.name}</h2>
            <span className="text-sm text-mammoth-sub">{menu.cat}</span>
          </div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-mammoth-ink cursor-pointer">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="rounded"
            />
            실측 확인 완료
          </label>
        </div>

        {/* 사이즈 탭 */}
        <div className="flex gap-2 mb-5">
          {uniqueSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${
                selectedSize === size
                  ? "bg-mammoth-brand text-white shadow-sm"
                  : "border border-mammoth-line text-mammoth-sub hover:bg-mammoth-bg"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* 선택된 사이즈의 온도별 레시피 */}
        <div className="space-y-4">
          {selectedVariants.map((variant) => (
            <div key={variant.key} className="rounded-xl border border-mammoth-line overflow-hidden">
              {/* 온도 헤더 */}
              <div className="bg-mammoth-bg px-4 py-2.5 border-b border-mammoth-line">
                <span className="font-bold text-sm text-mammoth-ink">{variant.temp} 레시피</span>
              </div>
              <VariantEditor
                variant={variant}
                onUpdateStep={(stepId, field) => updateStep(variant.key, stepId, field)}
                onAddStep={(type) => addStep(variant.key, type)}
                onRemoveStep={(stepId) => removeStep(variant.key, stepId)}
                onMoveStep={(stepId, dir) => moveStep(variant.key, stepId, dir)}
                onUpdateVariant={(field) => updateVariant(variant.key, field)}
              />
            </div>
          ))}
        </div>

        {/* 저장/취소 */}
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

  const cats = ["전체", ...Array.from(new Set(menus.map((m) => m.cat)))];
  const verified = menus.filter((m) => m.verified).length;
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
                  {verified}{" "}
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
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">레시피</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">실측</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">편집</th>
                    <th className="px-3 py-3 text-center font-semibold text-mammoth-sub">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((menu) => (
                    <tr
                      key={menu.name}
                      className="border-b border-mammoth-line last:border-0 hover:bg-mammoth-bg/40 transition"
                    >
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
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) return;
                            await deleteMenu(menu.name);
                            setMenus((prev) => prev.filter((m) => m.name !== menu.name));
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
