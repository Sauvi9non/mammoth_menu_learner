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
  is_popular  smallint    NOT NULL DEFAULT 1 CHECK (is_popular BETWEEN 1 AND 5),
  brand       text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


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
  default_duration text,
  icon             text,
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_actions_updated_at
  BEFORE UPDATE ON public.actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 5. variants  (온도별 레시피 — 사이즈는 steps 내 amount로 표현)
--
-- steps jsonb 형식:
--   재료(고정량):   { "ingredient": "얼음" }
--   재료(사이즈별): { "ingredient": "에스프레소샷", "amount": {"S":"1샷","M":"2샷","L":"3샷"} }
--   재료(단일량):   { "ingredient": "설탕시럽", "amount": "10ml" }
--   행동:           { "action": "젓기" }
-- -------------------------------------------------------------
CREATE TABLE public.variants (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id     uuid        NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  temp        text        NOT NULL CHECK (temp IN ('아이스', '핫')),
  sizes       text[]      NOT NULL DEFAULT '{S,M,L}',
  steps       jsonb       NOT NULL DEFAULT '[]',
  verified    boolean     NOT NULL DEFAULT false,
  verified_at timestamptz,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (menu_id, temp)
);

CREATE TRIGGER trg_variants_updated_at
  BEFORE UPDATE ON public.variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -------------------------------------------------------------
-- 6. guides  (운영 지침 — 메뉴 DB 완성 후 추가 예정)
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
