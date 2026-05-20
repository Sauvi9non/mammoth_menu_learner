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
};

export type MenuData = {
  brand: string;
  menus: Menu[];
};