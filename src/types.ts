// ── 뷰모델 (컴포넌트가 사용하는 타입, 변경 금지) ──────────────────────────

export type StepItem =
  | string
  | {
      item: string;
      amount?: string;
      action?: string;
      topping?: boolean;
    };

export type Variant = {
  temp: string;
  size: string;
  steps: StepItem[];
  note: string | null;
  uncertain: boolean;
};

export type Menu = {
  id: string;           // menus.id (UUID)
  name: string;
  cat: string;
  is_new: boolean;
  is_discontinuing: boolean;
  variants: Variant[];
  temps: string[];
  has_recipe: boolean;
  has_uncertain: boolean;
  verified?: boolean;
  base_recipe_id?: string | null;   // base_recipes.id (verified 토글용)
};

// ── DB 타입 (Supabase 응답 그대로) ────────────────────────────────────────

export type DbIngredient = { id: string; name: string; category: string | null };
export type DbAction     = { id: string; name: string };

export type DbRecipeStep = {
  id: string;
  order_num: number;
  amount: string | null;
  duration: number | null;
  note: string | null;
  ingredients: DbIngredient | null;
  actions: DbAction | null;
};

export type DbBaseRecipe = {
  id: string;
  default_temp: string | null;
  default_size: string | null;
  default_cup: string | null;
  verified: boolean;
  verified_at: string | null;
  note: string | null;
  recipe_steps: DbRecipeStep[];
};

export type DbOptionDiff = {
  id: string;
  option_type: string;
  option_value: string;
  diff_steps: StepItem[];
  diff_note: string | null;
};

export type DbMenu = {
  id: string;
  name: string;
  status: "상시" | "신메뉴" | "단종예정" | "단종" | "품절";
  price: number | null;
  is_popular: boolean;
  brand: string | null;
  menu_categories: { name: string };
  base_recipes: DbBaseRecipe[];
  option_diffs: DbOptionDiff[];
};
