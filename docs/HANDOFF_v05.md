# 핸드오프 — 현재 상태 (2026-06-08)

> HANDOFF_v04.md를 대체하는 단일 출처. 다른 문서와 충돌하면 이 문서를 따른다.

---

## 0. 한 줄 요약

Firebase 완전 제거 완료. Supabase(Postgres) 연결 및 기본 데이터 적재까지 완료. 아메리카노 데이터로 앱 동작 확인.

---

## 1. 현재 작동 상태

| 항목 | 상태 |
|------|------|
| React 앱 (Vite + TS + Tailwind) | ✅ 정상 |
| Firebase 코드 | ✅ 완전 제거 |
| Supabase 연결 | ✅ 연결됨 |
| Supabase 테이블 (8개) | ✅ 생성 완료 |
| RLS 정책 | ✅ 설정 완료 (읽기 공개, 쓰기 로그인 필요) |
| 마스터 데이터 (카테고리·재료·행동·메뉴·베이스레시피) | ✅ 97개 메뉴 적재 |
| recipe_steps | ⚠️ 아메리카노 3건만 입력됨 |
| option_diffs | ⚠️ 아메리카노 5건만 입력됨 |
| 앱 동작 확인 | ✅ 아메리카노 레시피 표시 확인 |
| Google OAuth (Supabase) | ❌ 미설정 — Google Cloud Console 작업 필요 |
| 관리자 페이지 로그인 | ❌ OAuth 설정 후 가능 |
| Vercel 배포 | 미확인 |
| LLM Q&A | 의도적 보류 |
| Git 브랜치 | `migrate_supabase` (작업 중) |

---

## 2. 오늘 한 일 (2026-06-08)

### Firebase → Supabase 코드 교체
- `src/lib/firebase.ts` 삭제 → `src/lib/supabase.ts` 생성
- `src/hooks/useAuth.ts` — Firebase Auth → Supabase Auth
- `src/hooks/useMenus.ts` — Firestore → Supabase 중첩 조인 쿼리 + `dbToMenu()` 변환 함수
- `src/pages/AdminPage.tsx` — 새 스키마 기준으로 재작성 (verified 토글, 삭제)
- `firebase` 패키지 제거, `@supabase/supabase-js` 설치

### 타입 구조 정비 (`src/types.ts`)
- 뷰모델 타입(`Menu`, `Variant`, `StepItem`) 유지 — 컴포넌트 변경 없음
- DB 타입(`DbMenu`, `DbBaseRecipe`, `DbRecipeStep` 등) 추가
- `Menu`에 `id` (UUID), `base_recipe_id` 추가

### Supabase 설정
- 8개 테이블 생성 (`docs/schema.sql`)
- DBeaver 연결: Session Pooler (`aws-0-<region>.pooler.supabase.com:5432`, username `postgres.<project-ref>`)
- RLS 정책 설정 (읽기 공개, 쓰기 authenticated)
- `actions.default_duration` 컬럼 타입 `integer → text` 변경 (실제 데이터가 "2~3회", "레벨3" 등 텍스트)

### 데이터 적재
- `docs/seed.sql` 생성 (MML.xlsx 기반 자동 생성 스크립트)
- 마스터 데이터 전체 적재: menu_categories 5건, ingredients 31건, actions 8건, menus 97건, base_recipes 97건
- 아메리카노 recipe_steps 3건 (`얼음 → 냉수 → 에스프레소 샷 2샷`)
- 아메리카노 option_diffs 5건 (`아이스_S/L`, `핫_S/M/L`)

### option_diffs 설계 확정
- `option_type = 'variant'`, `option_value = '핫_M'` 형식으로 온도+사이즈 조합 통째로 저장
- 이유: 온도와 사이즈가 독립적이지 않음 (핫은 온수 양이 사이즈 버튼으로 결정됨)
- `dbToMenu()`에서 `'핫_M'.split('_')` → `temp='핫'`, `size='M'` 파싱 처리

---

## 3. 다음 할 일

### 즉시 (다음 세션 시작 시)
1. **Google OAuth 설정** — Supabase dashboard → Authentication → Providers → Google → Enable
   - Google Cloud Console에서 OAuth 2.0 클라이언트 생성
   - Redirect URI: `https://deiipoteumwadjxnblaq.supabase.co/auth/v1/callback`
   - Client ID/Secret → Supabase에 입력
2. **관리자 페이지 로그인 확인** (`http://localhost:5173/admin`)

### 데이터 입력 (엑셀 → seed.sql)
- MML.xlsx의 `recipe_steps` 시트 나머지 메뉴 채우기
- MML.xlsx의 `option_diffs` 시트 나머지 메뉴 채우기
- 채우면 seed.sql 재생성 요청 → DBeaver에서 실행

### UI 개선
- 다음 세션에서 구체적으로 정의 예정

### 이후
- Vercel 배포 + 환경변수 설정
- LLM Q&A 재연결 (서버리스 함수, 마지막 작업)

---

## 4. 주요 파일

| 파일 | 역할 |
|------|------|
| `src/lib/supabase.ts` | Supabase 클라이언트 |
| `src/hooks/useMenus.ts` | 메뉴 데이터 조회 + DB→뷰모델 변환 |
| `src/hooks/useAuth.ts` | Supabase Auth (Google OAuth) |
| `src/pages/AdminPage.tsx` | 관리자 페이지 |
| `src/types.ts` | 뷰모델 타입 + DB 타입 |
| `docs/schema.sql` | 8개 테이블 DDL |
| `docs/seed.sql` | 전체 데이터 INSERT (MML.xlsx 기반) |
| `docs/MML.xlsx` | 메뉴 원본 데이터 (시트별 테이블 구조) |

---

## 5. 환경 정보

- OS: macOS, Node v23.7.0
- 스택: Vite + React + TypeScript + Tailwind v3
- DB: Supabase Postgres (Session Pooler 연결)
- Supabase 프로젝트: `deiipoteumwadjxnblaq`
- Git: `migrate_supabase` 브랜치에서 작업 중
- 배포: Vercel (예정)
