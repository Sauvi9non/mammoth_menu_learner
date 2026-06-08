# 핸드오프 — 현재 상태 (2026-05-28)

> 이전 문서들(`PRD.md`, `HANDOFF.md`, `MEMO_주말정리용.md`, `HANDOFF_DB설계.md`)에 일부 부정확한 내용이 있음.
> **이 문서가 지금 시점의 정확한 상태를 담은 단일 출처(single source of truth).** 다른 문서와 충돌하면 이 문서를 따른다.

---

## 0. 한 줄 요약

**Firestore에서 작동 중인 메뉴 학습 앱을 Supabase(Postgres)로 완전 이전한다.** 동시에 데이터 구조를 "온도별 분리" → "베이스 + 옵션 차이 + 정규화"로 재설계한다.

---

## 1. 현재 작동 상태 (실제 구현된 것)

| 항목                              | 상태                                               |
| --------------------------------- | -------------------------------------------------- |
| 로컬 React (Vite + TS + Tailwind) | ✅ 완성                                            |
| Firestore 연결                    | ✅ 작동 중                                         |
| 메뉴 데이터 (Firestore에 저장)    | ✅ 들어가 있음                                     |
| 데이터 구조 (현재 Firestore)      | "온도별 분리" (옛 JSON 그대로 옮김)                |
| CRUD                              | ✅ 구현 완료                                       |
| 관리자 페이지                     | ✅ 구현 완료                                       |
| Auth/권한                         | 상태 미확인 — 다음 작업 시작 전 확인 필요          |
| GitHub                            | ✅ push 완료 (키 제외)                             |
| Vercel 배포                       | 미확인 — 안 됐을 가능성                            |
| LLM Q&A                           | 미구현 (의도적 보류)                               |
| Supabase 프로젝트                 | ✅ 생성, DBeaver 연결 확인됨 (Session Pooler 사용) |
| Supabase 테이블                   | ❌ 아직 비어 있음                                  |

## 2. 왜 Supabase로 가는가

1. 데이터 모델을 ERD로 그려보니 **관계형이 더 적합** — menu_categories, ingredients, actions 같은 마스터 데이터가 자연스럽게 분리됨
2. **현재 Firestore 사용에서 데이터 입력·수정 불편 체감** — 이게 결정적
3. 게임 확장 시 ingredients 마스터 테이블이 필수 (NoSQL에선 어색)
4. 데이터 분석 직군 포트폴리오에 Postgres + 관계형 설계 경험 가치 있음

## 3. 마이그레이션 전략 — 3단계 분리

**저장소 이동과 구조 변환을 한 번에 하면 디버깅 지옥.** 단계 분리 필수:

### Phase 1 — Supabase 준비 + 데이터 이전

- 1-A: SQL DDL 작성·실행 → 7개 테이블 생성
- 1-B: 현재 Firestore 데이터 export → 새 구조로 변환하는 마이그레이션 스크립트 작성·실행
- 이 시점에도 앱은 _여전히 Firestore를 보고 있음_

### Phase 2 — 앱 연결 전환

- 앱의 Firestore 호출을 Supabase 호출로 교체 (메인 화면 + 관리자 페이지)
- Supabase Auth + RLS로 권한 설정

### Phase 3 — Firestore 정리

- Firestore 호출 코드 제거, Firebase 의존성 제거
- Firebase 프로젝트는 _완전히 작동 확인 후_ 제거

## 4. Git 전략

- `main`: 작동하는 Firestore 버전 그대로 (안전망)
- `feature/supabase-migration`: 이 작업 진행
- Phase 2까지 완료·검증 후 main 머지, 그다음 Phase 3 진행

## 5. 7개 테이블 스키마 (확정)

```
menu_categories  카테고리 마스터
menus            메뉴 기본 정보 (category_id FK)
base_recipes     메뉴별 베이스 레시피 1개 (menu_id FK, 디폴트 옵션 기준)
recipe_steps     베이스 레시피의 단계 (base_recipe_id FK, ingredient_id FK XOR action_id FK)
ingredients      재료 마스터 (게임 확장 + 역검색용)
actions          행동 마스터 (게임 확장용)
option_diffs     베이스에서 옵션별 차이만 (menu_id FK, diff_steps jsonb)
guides           운영지침 (메뉴 DB 전환 후 추가)
```

### SQL DDL 작성 시 반영할 디테일

- 모든 테이블에 `created_at`, `updated_at TIMESTAMPTZ DEFAULT now()`
- `base_recipes`에 `verified BOOLEAN`, `verified_at TIMESTAMPTZ`
- `menus.status`: 5개 값(상시/신메뉴/단종예정/단종/품절). ENUM 또는 text + CHECK
- `recipe_steps`에 XOR CHECK:
  ```sql
  CHECK (
    (ingredient_id IS NOT NULL AND action_id IS NULL) OR
    (ingredient_id IS NULL AND action_id IS NOT NULL)
  )
  ```
- `ingredients.name`, `actions.name`, `menu_categories.name` 모두 `UNIQUE`
- `id`는 모두 `uuid DEFAULT gen_random_uuid()`
- FK는 `ON DELETE CASCADE` (메뉴 삭제 시 베이스·diff·step도 같이 삭제) 또는 적절한 정책

### 의도적으로 _지금 안 하는_ 것

- 옵션 조합 차이 (예: "핫+L일 때만 추가 변화") — 매머드에 그런 케이스 거의 없을 듯. 필요해지면 `option_diffs`에 condition 컬럼 추가.
- ingredients/actions의 게임용 메타데이터 — 현재는 `id/name/category/icon/color`까지만. 게임 만들 때 컬럼 추가.

## 6. 확정된 설계 결정 (변경 안 함)

- **옵션 처리**: (B) 베이스 1개 + 옵션 차이 구조 (옵션 조합별 완전 레시피 = 탈락)
- **ingredients/actions 별도 테이블**: 게임 확장 + 역검색·통계 목적
- **option_diffs는 jsonb**: diff 가변적이고 양 적어 정규화하지 않음. 단, jsonb 내부에서도 ingredient_id/action_id 기반 작성
- **권한 모델**: 읽기 공개 + 쓰기는 본인 로그인 시만 (Supabase RLS)
- **CRUD UI**: 별도 `/admin` 페이지 (Firestore에서 이미 구현, Supabase 호출로만 교체)
- **LLM**: 현재 비활성화 유지. 모든 작업 완료 후 마지막에 서버리스 함수로 재연결
- **Anthropic 키**: 서버리스 함수 + Vercel 환경변수 (절대 프론트 노출 금지)
- **Supabase 키 (anon key)**: 프론트엔드 노출 무방, 보안은 RLS로

## 7. 다음 작업 (Phase 1-A부터)

### 사용자가 이미 한 일

- ✅ Supabase 프로젝트 생성, DB 비밀번호 재설정
- ✅ DBeaver로 연결 확인 (Session Pooler 사용 — IPv6 직접연결 한국 환경에서 불가)
- ✅ Git 브랜치 `feature/supabase-migration` 생성 (예정)

### Claude Code와 진행할 일

1. **SQL DDL 작성** — 위 스키마 + 디테일 모두 반영, 단일 `.sql` 파일로
2. Supabase SQL Editor에서 실행 → 7개 테이블 생성 확인
3. **Firestore 데이터 export** — 현재 Firestore에 있는 데이터를 JSON으로 추출하는 스크립트
4. **마이그레이션 스크립트** — Firestore JSON(온도별 분리) → Supabase 새 구조(베이스+옵션차이)로 변환
   - **반자동 작업**: 스크립트가 베이스 자동 잡아주고, 옵션 차이는 사람이 검토·입력
5. Supabase 데이터 적재 후 검증

### 사용자가 직접 해야 하는 일

- Supabase 대시보드 작업 (테이블 확인, RLS 설정, Auth 설정)
- Vercel 환경변수 입력 (배포 시)
- 최종 검증 (앱이 의도대로 동작하는지)

## 8. 환경 정보

- OS: macOS
- Node: v23.7.0
- 스택: Vite + React + TypeScript + Tailwind v3
- 현재 DB: Firebase Firestore (이전 예정)
- 새 DB: Supabase (Postgres) — Session Pooler 연결 (`aws-0-<region>.pooler.supabase.com:5432`, username 형식 `postgres.<project-ref>`)
- 배포 환경: Vercel (예정)
- Git: `main`(Firestore 버전) + `feature/supabase-migration`(작업 브랜치)

## 9. Claude Code 첫 지시 예시

> "이 핸드오프(HANDOFF_v0.4.md)를 읽고 현재 상태를 파악해줘. 현재 Firestore에서 작동 중인 앱을 Supabase로 이전하려고 해. 첫 작업으로 5번에 정리된 7개 테이블 스키마와 디테일을 모두 반영한 SQL DDL을 작성해줘. 단일 .sql 파일로, Supabase SQL Editor에 그대로 붙여넣어 실행할 수 있게. 작성 후 어떤 의도로 각 제약을 넣었는지 간략히 설명해줘."

---

## 부록 — 이전 문서들의 처리

| 파일                 | 처리                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `PRD.md`             | 유지 (큰 그림·역사). 단 *Firebase로 간다*는 기술 선택 부분은 이 문서에 의해 갱신됨                |
| `HANDOFF.md` (v0.3)  | 일부 부정확 — 이 문서로 대체                                                                      |
| `MEMO_주말정리용.md` | 유지 (설계 의사결정 기록). 단 _"아직 Firebase 안 만들었다"는 전제는 사실과 다름_ — 이 문서로 갱신 |
| `HANDOFF_DB설계.md`  | 유지 (스키마·근거). 단 _"Firestore 한 번도 만든 적 없다"는 전제는 사실과 다름_                    |

향후 정리: 작업 마무리 시점에 이전 문서들을 `archive/` 폴더로 옮기거나 통합 정리 권장.
