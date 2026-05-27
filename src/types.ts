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
  name: string;
  cat: string;
  is_new: boolean;
  is_discontinuing: boolean;
  variants: Variant[];
  temps: string[];
  has_recipe: boolean;
  has_uncertain: boolean;
  verified?: boolean;   // 실측 레시피 확인 여부
  updated_at?: string;  // ISO 날짜 문자열
};

export type MenuData = {
  brand: string;
  menus: Menu[];
};