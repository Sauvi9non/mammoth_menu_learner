import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DbMenu, Menu, StepItem, Variant } from "../types";

const MENUS_QUERY = `
  id, name, status, price, is_popular, brand,
  menu_categories!inner ( name ),
  base_recipes (
    id, default_temp, default_size, default_cup, verified, verified_at, note,
    recipe_steps (
      id, order_num, amount, duration, note,
      ingredients ( id, name, category ),
      actions ( id, name )
    )
  ),
  option_diffs ( id, option_type, option_value, diff_steps, diff_note )
` as const;

function dbToMenu(raw: DbMenu): Menu {
  const base = raw.base_recipes?.[0] ?? null;

  const baseSteps: StepItem[] = base
    ? [...(base.recipe_steps ?? [])]
        .sort((a, b) => a.order_num - b.order_num)
        .map((s): StepItem | null => {
          if (s.ingredients) return s.amount ? { item: s.ingredients.name, amount: s.amount } : s.ingredients.name;
          if (s.actions) return s.actions.name;
          return null;
        })
        .filter((s): s is StepItem => s !== null)
    : [];

  const baseVariant: Variant | null = base
    ? {
        temp: base.default_temp ?? "기본",
        size: base.default_size ?? "",
        steps: baseSteps,
        note: base.note ?? null,
        uncertain: false,
      }
    : null;

  const diffVariants: Variant[] = (raw.option_diffs ?? []).map((d) => {
    // "핫_M" → temp="핫", size="M"
    if (d.option_type === "variant") {
      const [temp, size] = d.option_value.split("_");
      return {
        temp: temp ?? base?.default_temp ?? "기본",
        size: size ?? base?.default_size ?? "",
        steps: d.diff_steps ?? [],
        note: d.diff_note ?? null,
        uncertain: false,
      };
    }
    return {
      temp: d.option_type === "temp" ? d.option_value : (base?.default_temp ?? "기본"),
      size: d.option_type === "size" ? d.option_value : (base?.default_size ?? ""),
      steps: d.diff_steps ?? [],
      note: d.diff_note ?? null,
      uncertain: false,
    };
  });

  const variants = [...(baseVariant ? [baseVariant] : []), ...diffVariants];
  const temps = [...new Set(variants.map((v) => v.temp))];

  return {
    id: raw.id,
    name: raw.name,
    cat: raw.menu_categories?.name ?? "",
    is_new: raw.status === "신메뉴",
    is_discontinuing: raw.status === "단종예정" || raw.status === "단종",
    variants,
    temps,
    has_recipe: baseSteps.length > 0,
    has_uncertain: false,
    verified: base?.verified ?? false,
    base_recipe_id: base?.id ?? null,
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
