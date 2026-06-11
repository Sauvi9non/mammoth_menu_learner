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
  size: string;   // 제공 사이즈 목록, 예: "S/M/L"
  steps: StepItem[];
  note: string | null;
  uncertain: boolean;
};

export type Menu = {
  id: string;
  name: string;
  cat: string;
  is_new: boolean;
  is_discontinuing: boolean;
  variants: Variant[];
  temps: string[];
  has_recipe: boolean;
  has_uncertain: boolean;
  verified?: boolean;   // 모든 variants가 verified일 때 true
};

// ── DB 타입 (Supabase 응답 그대로) ────────────────────────────────────────

// variants.steps 각 항목
export type DbVariantStep =
  | { ingredient: string; amount?: string | Record<string, string> }
  | { action: string };

export type DbVariant = {
  id: string;
  temp: "아이스" | "핫";
  sizes: string[];
  steps: DbVariantStep[];
  verified: boolean;
  verified_at: string | null;
  note: string | null;
};

export type DbMenu = {
  id: string;
  name: string;
  status: "상시" | "신메뉴" | "단종예정" | "단종" | "품절";
  price: number | null;
  is_popular: number;
  brand: string | null;
  menu_categories: { name: string };
  variants: DbVariant[];
};
