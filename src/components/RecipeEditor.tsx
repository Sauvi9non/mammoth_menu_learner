import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { DbVariantStep, Menu } from "../types";

// ─── Editable types ──────────────────────────────────────────────────────────

type AmountMode = "none" | "fixed" | "sized";

type EditableStep = {
  key: string;
  type: "ingredient" | "action";
  name: string;
  amountMode: AmountMode;
  fixed: string;
  sized: Record<string, string>; // { S: "1샷", M: "2샷", L: "3샷" }
};

type EditableVariant = {
  id: string | null;
  temp: "아이스" | "핫";
  sizes: string[];
  steps: EditableStep[];
  verified: boolean;
  saving: boolean;
  deleting: boolean;
  togglingVerified: boolean;
};

// ─── Converters ──────────────────────────────────────────────────────────────

let _uid = 0;
const uid = () => String(++_uid);

function fromDbStep(s: DbVariantStep): EditableStep {
  if ("action" in s) {
    return { key: uid(), type: "action", name: s.action, amountMode: "none", fixed: "", sized: {} };
  }
  const { ingredient, amount } = s;
  if (!amount) {
    return { key: uid(), type: "ingredient", name: ingredient, amountMode: "none", fixed: "", sized: {} };
  }
  if (typeof amount === "string") {
    return { key: uid(), type: "ingredient", name: ingredient, amountMode: "fixed", fixed: amount, sized: {} };
  }
  return {
    key: uid(), type: "ingredient", name: ingredient,
    amountMode: "sized", fixed: "", sized: amount as Record<string, string>,
  };
}

function toDbStep(s: EditableStep): DbVariantStep {
  if (s.type === "action") return { action: s.name };
  if (s.amountMode === "none") return { ingredient: s.name };
  if (s.amountMode === "fixed") return { ingredient: s.name, amount: s.fixed };
  const obj: Record<string, string> = {};
  for (const [k, v] of Object.entries(s.sized)) if (v.trim()) obj[k] = v.trim();
  return { ingredient: s.name, amount: obj };
}

function blankStep(type: "ingredient" | "action"): EditableStep {
  return { key: uid(), type, name: "", amountMode: "none", fixed: "", sized: {} };
}

// ─── StepRow ─────────────────────────────────────────────────────────────────

interface StepRowProps {
  step: EditableStep;
  sizes: string[];
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<EditableStep>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

function StepRow({ step, sizes, isFirst, isLast, onChange, onMove, onRemove }: StepRowProps) {
  return (
    <div className="flex flex-wrap gap-2 items-start rounded-xl border border-mammoth-line bg-white px-3 py-2.5">
      {/* Type toggle */}
      <div className="flex rounded-lg border border-mammoth-line overflow-hidden shrink-0 self-center">
        {(["ingredient", "action"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ type: t, amountMode: "none" })}
            className={`px-2.5 py-1 text-xs font-semibold transition ${
              step.type === t
                ? "bg-mammoth-brand text-white"
                : "text-mammoth-sub hover:bg-mammoth-bg"
            }`}
          >
            {t === "ingredient" ? "재료" : "행동"}
          </button>
        ))}
      </div>

      {/* Name input */}
      <input
        className="flex-1 min-w-[96px] rounded-lg border border-mammoth-line px-3 py-1.5 text-sm text-mammoth-ink outline-none focus:border-mammoth-brand"
        placeholder={step.type === "ingredient" ? "재료명" : "행동명"}
        value={step.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />

      {/* Amount controls (ingredient only) */}
      {step.type === "ingredient" && (
        <>
          <select
            className="rounded-lg border border-mammoth-line px-2 py-1.5 text-xs text-mammoth-sub bg-white outline-none focus:border-mammoth-brand self-center"
            value={step.amountMode}
            onChange={(e) => onChange({ amountMode: e.target.value as AmountMode })}
          >
            <option value="none">용량없음</option>
            <option value="fixed">고정</option>
            <option value="sized">사이즈별</option>
          </select>

          {step.amountMode === "fixed" && (
            <input
              className="w-20 rounded-lg border border-mammoth-line px-3 py-1.5 text-sm text-mammoth-ink outline-none focus:border-mammoth-brand"
              placeholder="예: 10ml"
              value={step.fixed}
              onChange={(e) => onChange({ fixed: e.target.value })}
            />
          )}

          {step.amountMode === "sized" && (
            <div className="flex gap-2">
              {sizes.map((sz) => (
                <label key={sz} className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-mammoth-sub font-bold">{sz}</span>
                  <input
                    className="w-14 rounded-lg border border-mammoth-line px-2 py-1 text-xs text-mammoth-ink outline-none focus:border-mammoth-brand text-center"
                    placeholder="—"
                    value={step.sized[sz] ?? ""}
                    onChange={(e) =>
                      onChange({ sized: { ...step.sized, [sz]: e.target.value } })
                    }
                  />
                </label>
              ))}
            </div>
          )}
        </>
      )}

      {/* Move + delete */}
      <div className="flex items-center gap-0.5 ml-auto shrink-0 self-center">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMove(-1)}
          className="w-7 h-7 flex items-center justify-center rounded text-mammoth-sub hover:text-mammoth-ink disabled:opacity-20 transition"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMove(1)}
          className="w-7 h-7 flex items-center justify-center rounded text-mammoth-sub hover:text-mammoth-ink disabled:opacity-20 transition"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── VariantSection ───────────────────────────────────────────────────────────

const SIZES = ["S", "M", "L"];

interface VariantSectionProps {
  variant: EditableVariant;
  onUpdate: (patch: Partial<EditableVariant>) => void;
  onUpdateStep: (key: string, patch: Partial<EditableStep>) => void;
  onMoveStep: (key: string, dir: -1 | 1) => void;
  onRemoveStep: (key: string) => void;
  onAddStep: (type: "ingredient" | "action") => void;
  onToggleVerified: () => void;
  onSave: () => void;
  onDelete: () => void;
}

function VariantSection({
  variant,
  onUpdate,
  onUpdateStep,
  onMoveStep,
  onRemoveStep,
  onAddStep,
  onToggleVerified,
  onSave,
  onDelete,
}: VariantSectionProps) {
  const isIce = variant.temp === "아이스";
  const border = isIce ? "border-blue-200" : "border-orange-200";
  const headerBg = isIce ? "bg-blue-50" : "bg-orange-50";
  const label = isIce ? "text-blue-600" : "text-orange-600";
  const sizeBtnActive = isIce ? "bg-blue-500 text-white" : "bg-orange-500 text-white";
  const saveBtn = isIce
    ? "bg-blue-500 hover:bg-blue-600 text-white"
    : "bg-orange-500 hover:bg-orange-600 text-white";

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${border}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-2 ${headerBg}`}>
        <span className={`text-sm font-extrabold ${label}`}>
          {isIce ? "아이스" : "핫"}
        </span>
        {variant.id ? (
          <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
            저장됨
          </span>
        ) : variant.steps.length > 0 ? (
          <span className="text-xs text-amber-600 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
            미저장
          </span>
        ) : null}
        {variant.id && (
          <button
            type="button"
            onClick={onToggleVerified}
            disabled={variant.togglingVerified}
            className={`rounded-full px-3 py-0.5 text-xs font-semibold transition disabled:opacity-50 ${
              variant.verified
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-mammoth-warnBg text-mammoth-warn hover:bg-mammoth-warnBg/80"
            }`}
          >
            {variant.verified ? "실측 확인" : "실측 미확인"}
          </button>
        )}

        {/* Size toggles */}
        <div className="flex gap-1.5 ml-auto">
          {SIZES.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => {
                const next = variant.sizes.includes(sz)
                  ? variant.sizes.filter((s) => s !== sz)
                  : [...variant.sizes, sz].sort(
                      (a, b) => SIZES.indexOf(a) - SIZES.indexOf(b)
                    );
                onUpdate({ sizes: next });
              }}
              className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                variant.sizes.includes(sz)
                  ? sizeBtnActive
                  : "border border-mammoth-line text-mammoth-sub bg-white"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 flex flex-col gap-2">
        {variant.steps.length === 0 && (
          <p className="text-sm text-mammoth-sub text-center py-3">
            스텝을 추가하세요
          </p>
        )}

        {variant.steps.map((step, idx) => (
          <StepRow
            key={step.key}
            step={step}
            sizes={variant.sizes}
            isFirst={idx === 0}
            isLast={idx === variant.steps.length - 1}
            onChange={(patch) => onUpdateStep(step.key, patch)}
            onMove={(dir) => onMoveStep(step.key, dir)}
            onRemove={() => onRemoveStep(step.key)}
          />
        ))}

        {/* Footer buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => onAddStep("ingredient")}
            className="rounded-full border border-mammoth-line px-4 py-1.5 text-xs font-semibold text-mammoth-sub hover:bg-white transition"
          >
            + 재료
          </button>
          <button
            type="button"
            onClick={() => onAddStep("action")}
            className="rounded-full border border-mammoth-line px-4 py-1.5 text-xs font-semibold text-mammoth-sub hover:bg-white transition"
          >
            + 행동
          </button>

          <div className="flex gap-2 ml-auto">
            {variant.id && (
              <button
                type="button"
                onClick={onDelete}
                disabled={variant.deleting}
                className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-50"
              >
                {variant.deleting ? "삭제 중..." : "삭제"}
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={variant.saving || (variant.steps.length === 0 && !variant.id)}
              className={`rounded-full px-5 py-1.5 text-xs font-bold transition disabled:opacity-40 ${saveBtn}`}
            >
              {variant.saving ? "저장 중..." : variant.id ? "업데이트" : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RecipeEditor (modal) ─────────────────────────────────────────────────────

interface Props {
  menu: Menu;
  onClose: () => void;
  onSaved: () => void;
}

export default function RecipeEditor({ menu, onClose, onSaved }: Props) {
  const [variants, setVariants] = useState<EditableVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("variants")
      .select("id, temp, sizes, steps, verified")
      .eq("menu_id", menu.id)
      .then(({ data }) => {
        const existing = (data ?? []) as {
          id: string; temp: string; sizes: string[]; steps: DbVariantStep[]; verified: boolean;
        }[];

        setVariants(
          (["아이스", "핫"] as const).map((temp) => {
            const found = existing.find((v) => v.temp === temp);
            if (found) {
              return {
                id: found.id, temp,
                sizes: found.sizes ?? ["S", "M", "L"],
                steps: (found.steps ?? []).map(fromDbStep),
                verified: found.verified ?? false,
                saving: false, deleting: false, togglingVerified: false,
              };
            }
            return {
              id: null, temp, sizes: ["S", "M", "L"], steps: [],
              verified: false, saving: false, deleting: false, togglingVerified: false,
            };
          })
        );
        setLoading(false);
      });
  }, [menu.id]);

  function patchVariant(temp: string, patch: Partial<EditableVariant>) {
    setVariants((vs) => vs.map((v) => (v.temp === temp ? { ...v, ...patch } : v)));
  }

  function patchStep(temp: string, key: string, patch: Partial<EditableStep>) {
    setVariants((vs) =>
      vs.map((v) =>
        v.temp !== temp ? v
          : { ...v, steps: v.steps.map((s) => (s.key === key ? { ...s, ...patch } : s)) }
      )
    );
  }

  function moveStep(temp: string, key: string, dir: -1 | 1) {
    setVariants((vs) =>
      vs.map((v) => {
        if (v.temp !== temp) return v;
        const idx = v.steps.findIndex((s) => s.key === key);
        const ni = idx + dir;
        if (ni < 0 || ni >= v.steps.length) return v;
        const steps = [...v.steps];
        [steps[idx], steps[ni]] = [steps[ni], steps[idx]];
        return { ...v, steps };
      })
    );
  }

  async function saveVariant(v: EditableVariant) {
    patchVariant(v.temp, { saving: true });
    const steps = v.steps.map(toDbStep);
    if (v.id) {
      await supabase.from("variants").update({ sizes: v.sizes, steps }).eq("id", v.id);
      patchVariant(v.temp, { saving: false });
    } else {
      const { data } = await supabase
        .from("variants")
        .insert({ menu_id: menu.id, temp: v.temp, sizes: v.sizes, steps })
        .select("id")
        .single();
      patchVariant(v.temp, { saving: false, id: data?.id ?? null });
    }
    onSaved();
  }

  async function toggleVerified(v: EditableVariant) {
    if (!v.id) return;
    const next = !v.verified;
    patchVariant(v.temp, { togglingVerified: true });
    await supabase
      .from("variants")
      .update({ verified: next, verified_at: next ? new Date().toISOString() : null })
      .eq("id", v.id);
    patchVariant(v.temp, { verified: next, togglingVerified: false });
    onSaved();
  }

  async function deleteVariant(v: EditableVariant) {
    if (!v.id) { patchVariant(v.temp, { steps: [] }); return; }
    patchVariant(v.temp, { deleting: true });
    await supabase.from("variants").delete().eq("id", v.id);
    patchVariant(v.temp, { id: null, steps: [], sizes: ["S", "M", "L"], deleting: false });
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-mammoth-bg shadow-2xl my-8">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mammoth-line">
          <div>
            <h2 className="text-lg font-extrabold text-mammoth-ink">{menu.name}</h2>
            <p className="text-xs text-mammoth-sub mt-0.5">{menu.cat}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-mammoth-sub hover:text-mammoth-ink hover:bg-mammoth-line transition text-lg"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-mammoth-sub">불러오는 중...</div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {variants.map((v) => (
              <VariantSection
                key={v.temp}
                variant={v}
                onUpdate={(patch) => patchVariant(v.temp, patch)}
                onUpdateStep={(key, patch) => patchStep(v.temp, key, patch)}
                onMoveStep={(key, dir) => moveStep(v.temp, key, dir)}
                onRemoveStep={(key) =>
                  setVariants((vs) =>
                    vs.map((x) =>
                      x.temp === v.temp
                        ? { ...x, steps: x.steps.filter((s) => s.key !== key) }
                        : x
                    )
                  )
                }
                onAddStep={(type) =>
                  setVariants((vs) =>
                    vs.map((x) =>
                      x.temp === v.temp
                        ? { ...x, steps: [...x.steps, blankStep(type)] }
                        : x
                    )
                  )
                }
                onToggleVerified={() => void toggleVerified(v)}
                onSave={() => void saveVariant(v)}
                onDelete={() => {
                  if (confirm(`${v.temp} 레시피를 삭제할까요?`)) void deleteVariant(v);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
