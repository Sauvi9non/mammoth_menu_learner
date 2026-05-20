# Claude Code 핸드오프 문서

> 이 문서는 claude.ai에서 진행하던 작업을 Claude Code로 이어받기 위한 인수인계 문서입니다.
> Claude Code는 이 문서를 먼저 읽고 전체 맥락을 파악한 뒤 작업을 이어가면 됩니다.

---

## 0. 한 줄 요약

매머드 익스프레스 카페 신규 알바가 메뉴 97종을 효율적으로 외우기 위한 **메뉴 학습 웹앱**을 만드는 중. 기획(PRD)과 데이터 정리, 프로토타입(아티팩트)까지 완료했고, 이제 **로컬 React 프로젝트로 이식**하는 단계.

## 1. 함께 넘어온 파일들

| 파일 | 내용 | 용도 |
|---|---|---|
| `HANDOFF.md` | 이 문서 | 맥락 인수인계 |
| `PRD.md` | 제품 요구사항 문서 | 프로젝트 전체 맥락·기능·일정·확장계획. **먼저 읽어주세요** |
| `mammoth_grouped.json` | 메뉴 데이터 (97개 메뉴, 메뉴 단위 그룹핑) | 앱의 데이터 소스 |
| `MammothMenuLearner.jsx` | 지금까지 만든 프로토타입 (단일 파일 React) | 이식할 원본 코드 |

## 2. 지금까지 한 일

1. **기획**: PRD 작성 (문제정의 → 타겟 → 기능명세 → 기술스택 → 일정 → 성공기준)
2. **데이터 수집**: 유튜브 + 공식 메뉴 기반으로 엑셀에 메뉴/레시피 1차 입력
   - 139행(핫·아이스 분리) → 97개 메뉴(이름 기준 그룹핑)로 정규화
   - 레시피 입력된 메뉴 일부, 나머지는 교육 후 채울 예정
   - 불확실한 재료는 `?` 표기로 보존 (예: "헤이즐넛 시럽?")
3. **프로토타입**: 아티팩트로 카테고리 브라우저 + 검색 + 상세 모달 제작 완료

## 3. 데이터 구조 (mammoth_grouped.json)

```jsonc
{
  "brand": "매머드 익스프레스",
  "menus": [
    {
      "name": "아메리카노",
      "cat": "커피",              // 커피/콜드브루/논커피/티/에이드/프라페·블렌디드
      "is_new": false,            // 신메뉴 여부
      "is_discontinuing": false,  // 단종예정 여부
      "variants": [               // 온도 변형들
        {
          "temp": "핫",           // 핫/아이스/ICE ONLY/HOT ONLY/기타
          "size": "S/M/L",
          "steps": [],            // 제조 순서 (재료명 문자열 배열, 빈 배열이면 미입력)
          "note": null,           // 특이사항 (예: "티백은 2분 우린다")
          "uncertain": false      // 이 변형에 불확실(?) 항목 포함 여부
        },
        { "temp": "아이스", "size": "S/M/L", "steps": ["얼음","물","에스프레소 샷"], "note": null, "uncertain": false }
      ],
      "temps": ["핫","아이스"],   // 보유 온도 목록 (편의 필드)
      "has_recipe": true,         // 변형 중 하나라도 레시피 있으면 true
      "has_uncertain": false      // 변형 중 하나라도 불확실 항목 있으면 true
    }
  ]
}
```

## 4. 지금 환경 상태 (사용자 = 곽은서)

- **OS**: macOS
- **Node**: v23.7.0 설치 완료
- **진행 중인 셋업**: 다음 명령으로 Vite 프로젝트 생성 중
  ```bash
  cd ~/Desktop
  npm create vite@latest mammoth-menu -- --template react-ts
  cd mammoth-menu
  npm install
  npm install -D tailwindcss@3 postcss autoprefixer
  npx tailwindcss init -p
  ```
- **스택 결정**: Vite + React + **TypeScript** + **Tailwind CSS v3**
- 사용자는 React/TypeScript 경험 있음. 프론트엔드 개발자 지망은 아니며(데이터 분석 직군), 이 프로젝트는 "문제 발견 → 데이터 구조화 → 도구화" 사례로서의 포트폴리오 가치가 핵심.

## 5. 다음 할 일 (이식 작업)

프로토타입 `MammothMenuLearner.jsx`는 inline style로 작성돼 있음. 이걸 다음과 같이 이식:

1. **Tailwind 설정** — `tailwind.config.js`의 content 경로, `index.css`에 `@tailwind` 디렉티브 추가
2. **데이터 분리** — `mammoth_grouped.json`을 `src/data/menus.json`으로, TypeScript 타입 정의(`src/types.ts`) 작성
3. **컴포넌트 분리** — 단일 파일을 `App.tsx` + `components/`(MenuCard, DetailModal, SearchBar, CategoryTabs 등)로 분리
4. **inline style → Tailwind 클래스** 변환
5. 색상 팔레트는 프로토타입의 `C` 객체 참고 (브랜드 컬러: 진한 빨강 `#7A1F1A`, 배경 베이지 `#F7F3EC` 등) → `tailwind.config.js`의 theme.extend.colors로 정의 추천

### 기능 (프로토타입에 이미 구현됨, 유지할 것)
- 카테고리 탭 필터 (전체 + 5개 카테고리, 각 개수 표시)
- 메뉴명·재료 검색
- 메뉴 카드 (온도 배지, 신메뉴/단종 플래그, 레시피 상태, 카테고리 색상 블록 = 이미지 자리)
- 상세 모달: 온도 선택 → 사이즈 표시 → 해당 변형 제조순서, 불확실 항목 강조
- 레시피 입력 진행률 표시

### 주의/원칙
- **이미지**: 지금은 카테고리 색상 블록. 추후 사용자가 직접 그린 이미지로 교체 예정 → `<img>` 교체가 쉽도록 구조화
- **steps 확장성**: 현재 문자열 배열이지만, 추후 객체(`{item, amount, action, topping}`)로 확장 예정. 문자열·객체 모두 처리 가능하게 설계하면 좋음 (지금 당장은 문자열만)
- 데이터 정확도는 교육 후 검증 예정 (현재는 추정 데이터). `?` 표기 항목이 확인 대상.

## 6. 확장 계획 (지금은 안 함, 맥락만)

- **레시피 상세화**: 그램수·동작(젓기/블렌더/토핑/드리즐)을 step 객체로 추가
- **게임 모드 (후순위)**: 주문 받고 제한시간 안에 재료를 순서대로 골라 음료 완성하는 타이쿤식 게임. 기존 steps 배열을 정답 시퀀스로 재활용.
- 퀴즈 모드, 학습 진도 저장(localStorage), LLM Q&A (Claude API)

## 7. 사용자가 Claude Code에게 첫 지시로 하면 좋을 말 (예시)

> "HANDOFF.md와 PRD.md를 읽고 프로젝트 맥락을 파악해줘. MammothMenuLearner.jsx가 claude.ai에서 만든 프로토타입이고, mammoth_grouped.json이 데이터야. 현재 빈 Vite + React + TS 프로젝트에 Tailwind v3까지 설치된 상태고, 이 프로토타입을 컴포넌트로 분리하면서 Tailwind로 이식하고 싶어. 먼저 어떤 순서로 작업할지 계획을 알려줘."
