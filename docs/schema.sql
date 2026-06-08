-- =============================================================
-- Mammoth Menu Learner — Supabase DDL
-- Supabase SQL Editor에 그대로 붙여넣어 실행
-- =============================================================

-- updated_at 자동 갱신 트리거 함수 (모든 테이블 공용)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -------------------------------------------------------------
-- 1. menu_categories
-- -------------------------------------------------------------
CREATE TABLE public.menu_categories (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 2. menus
-- -------------------------------------------------------------
CREATE TABLE public.menus (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  category_id uuid        NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  status      text        NOT NULL DEFAULT '상시'
                          CHECK (status IN ('상시', '신메뉴', '단종예정', '단종', '품절')),
  price       integer,
  is_popular  boolean     NOT NULL DEFAULT false,
  brand       text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- category 삭제 시 menus가 있으면 막힘(RESTRICT).
-- menus 자체 삭제 시 아래 하위 테이블들은 CASCADE.


-- -------------------------------------------------------------
-- 3. ingredients  (재료 마스터)
-- -------------------------------------------------------------
CREATE TABLE public.ingredients (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL UNIQUE,
  category   text,
  icon       text,
  color      text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 4. actions  (행동 마스터)
-- -------------------------------------------------------------
CREATE TABLE public.actions (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text        NOT NULL UNIQUE,
  default_duration integer,                    -- 초 단위, 게임 확장용
  icon             text,
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_actions_updated_at
  BEFORE UPDATE ON public.actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 5. base_recipes  (메뉴 1개당 베이스 레시피 1개)
-- -------------------------------------------------------------
CREATE TABLE public.base_recipes (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id      uuid        NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  default_temp text,                           -- 예: '아이스', '핫'
  default_size text,                           -- 예: 'M'
  default_cup  text,                           -- 예: '플라스틱컵', '머그'
  verified     boolean     NOT NULL DEFAULT false,
  verified_at  timestamptz,
  note         text,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_base_recipes_updated_at
  BEFORE UPDATE ON public.base_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 6. recipe_steps  (베이스 레시피 단계)
-- -------------------------------------------------------------
CREATE TABLE public.recipe_steps (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  base_recipe_id uuid        NOT NULL REFERENCES public.base_recipes(id) ON DELETE CASCADE,
  order_num      integer     NOT NULL,
  ingredient_id  uuid        REFERENCES public.ingredients(id) ON DELETE SET NULL,
  action_id      uuid        REFERENCES public.actions(id) ON DELETE SET NULL,
  amount         text,                         -- 예: 'C선까지', '1샷'
  duration       integer,                      -- 초 단위 (행동에만 의미 있음)
  note           text,
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL,

  -- 재료와 행동 중 정확히 하나만 연결
  CONSTRAINT chk_recipe_steps_xor CHECK (
    (ingredient_id IS NOT NULL AND action_id IS NULL) OR
    (ingredient_id IS NULL     AND action_id IS NOT NULL)
  )
);

CREATE TRIGGER trg_recipe_steps_updated_at
  BEFORE UPDATE ON public.recipe_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 7. option_diffs  (베이스 대비 옵션별 차이)
-- -------------------------------------------------------------
CREATE TABLE public.option_diffs (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id      uuid        NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  option_type  text        NOT NULL,           -- 예: 'temp', 'size'
  option_value text        NOT NULL,           -- 예: '핫', 'L'
  diff_steps   jsonb       NOT NULL DEFAULT '[]',
  diff_note    text,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_option_diffs_updated_at
  BEFORE UPDATE ON public.option_diffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 8. guides  (운영 지침 — 메뉴 DB 완성 후 추가 예정)
-- -------------------------------------------------------------
CREATE TABLE public.guides (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  category   text,
  title      text        NOT NULL,
  content    text        NOT NULL,
  order_num  integer     NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_guides_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
