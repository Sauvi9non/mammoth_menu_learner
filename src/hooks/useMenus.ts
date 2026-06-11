import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DbMenu, DbVariant, DbVariantStep, Menu, StepItem, Variant } from "../types";

const MENUS_QUERY = `
  id, name, status, price, is_popular, brand,
  menu_categories!inner ( name ),
  variants ( id, temp, sizes, steps, verified, verified_at, note )
` as const;

// amount가 사이즈별 객체면 "S:1샷 / M:2샷 / L:3샷" 형태로 표시
function formatAmount(amount: string | Record<string, string> | undefined): string | undefined {
  if (!amount) return undefined;
  if (typeof amount === "string") return amount;
  return Object.entries(amount).map(([s, v]) => `${s}:${v}`).join(" / ");
}

function stepsToStepItems(steps: DbVariantStep[]): StepItem[] {
  return steps.map((s): StepItem => {
    if ("ingredient" in s) {
      const amt = formatAmount(s.amount);
      return amt ? { item: s.ingredient, amount: amt } : s.ingredient;
    }
    return s.action;
  });
}

function dbVariantToVariant(v: DbVariant): Variant {
  return {
    temp: v.temp,
    size: (v.sizes ?? []).join("/"),
    steps: stepsToStepItems(v.steps ?? []),
    note: v.note ?? null,
    uncertain: false,
  };
}

function dbToMenu(raw: DbMenu): Menu {
  const variants = (raw.variants ?? []).map(dbVariantToVariant);
  const temps = (raw.variants ?? []).map((v) => v.temp);
  const allVerified = (raw.variants ?? []).length > 0 && (raw.variants ?? []).every((v) => v.verified);

  return {
    id: raw.id,
    name: raw.name,
    cat: raw.menu_categories?.name ?? "",
    is_new: raw.status === "신메뉴",
    is_discontinuing: raw.status === "단종예정" || raw.status === "단종",
    variants,
    temps,
    has_recipe: (raw.variants ?? []).some((v) => (v.steps ?? []).length > 0),
    has_uncertain: false,
    verified: allVerified,
  };
}

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    supabase
      .from("menus")
      .select(MENUS_QUERY)
      .order("name")
      .then(({ data, error: err }) => {
        if (err) setError(new Error(err.message));
        else setMenus((data as unknown as DbMenu[]).map(dbToMenu));
        setLoading(false);
      });
  }, []);

  return { menus, loading, error };
}
