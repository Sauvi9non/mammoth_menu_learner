import type { Menu } from "./types";

export const CATS = ["전체", "커피", "콜드브루", "논커피", "티/에이드", "프라페/블렌디드"] as const;

export const CATEGORY_COLORS: Record<Exclude<(typeof CATS)[number], "전체">, string> = {
  커피: "#8A5A2B",
  콜드브루: "#5A4632",
  논커피: "#3F7D5C",
  "티/에이드": "#C06A3E",
  "프라페/블렌디드": "#7A5BA6",
};

export const categoryCount = (menus: Menu[]) =>
  CATS.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "전체" ? menus.length : menus.filter((menu) => menu.cat === cat).length;
    return acc;
  }, {} as Record<string, number>);
