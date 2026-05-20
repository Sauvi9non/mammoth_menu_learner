import { useState } from "react";
import type { Menu } from "../types";
import { CATS } from "../constants";
import { renderStepLabel } from "../utils";

type QuizType = "category" | "recipe";
type Phase = "setup" | "playing" | "done";

type Question = {
  prompt: string;
  hint?: string;
  choices: string[];
  answer: string;
  menuName: string;
};

const CATS_NO_ALL = CATS.filter((c) => c !== "전체");
const QUIZ_COUNT = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCategoryQuestion(menu: Menu): Question {
  const wrongCats = shuffle(CATS_NO_ALL.filter((c) => c !== menu.cat)).slice(0, 3);
  return {
    prompt: `"${menu.name}"이(가) 속하는 카테고리는?`,
    choices: shuffle([menu.cat, ...wrongCats]),
    answer: menu.cat,
    menuName: menu.name,
  };
}

function makeRecipeQuestion(menu: Menu, allMenus: Menu[]): Question | null {
  const variant = menu.variants.find((v) => v.steps.length >= 2);
  if (!variant) return null;
  const hint = variant.steps.slice(0, 4).map(renderStepLabel).join(" → ");
  const wrongNames = shuffle(
    allMenus.filter((m) => m.name !== menu.name && m.has_recipe).map((m) => m.name),
  ).slice(0, 3);
  if (wrongNames.length < 3) return null;
  return {
    prompt: "다음 재료 순서로 만드는 음료는?",
    hint,
    choices: shuffle([menu.name, ...wrongNames]),
    answer: menu.name,
    menuName: menu.name,
  };
}

function buildQuiz(type: QuizType, allMenus: Menu[]): Question[] {
  const pool = type === "recipe" ? allMenus.filter((m) => m.has_recipe) : allMenus;
  const questions: Question[] = [];
  for (const menu of shuffle(pool)) {
    if (questions.length >= QUIZ_COUNT) break;
    const q = type === "category" ? makeCategoryQuestion(menu) : makeRecipeQuestion(menu, allMenus);
    if (q) questions.push(q);
  }
  return questions;
}

type Props = { menus: Menu[] };

export default function QuizMode({ menus }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [quizType, setQuizType] = useState<QuizType>("category");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ q: Question; chosen: string }[]>([]);

  function start(type: QuizType) {
    const qs = buildQuiz(type, menus);
    setQuizType(type);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setPhase("playing");
  }

  function choose(choice: string) {
    if (selected) return;
    setSelected(choice);
  }

  function next() {
    if (!selected) return;
    const q = questions[current];
    const nextAnswers = [...answers, { q, chosen: selected }];
    setAnswers(nextAnswers);
    if (current + 1 >= questions.length) {
      setPhase("done");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <div>
          <h2 className="text-2xl font-extrabold text-mammoth-ink">퀴즈 모드</h2>
          <p className="mt-1 text-sm text-mammoth-sub">모드를 선택하고 {QUIZ_COUNT}문제를 풀어보세요.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => start("category")}
            className="rounded-[22px] border border-mammoth-line bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="text-2xl">📂</div>
            <div className="mt-3 text-base font-bold text-mammoth-ink">카테고리 맞추기</div>
            <div className="mt-1 text-sm text-mammoth-sub">메뉴 이름을 보고 카테고리를 골라요</div>
          </button>
          <button
            type="button"
            onClick={() => start("recipe")}
            className="rounded-[22px] border border-mammoth-line bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="text-2xl">🧾</div>
            <div className="mt-3 text-base font-bold text-mammoth-ink">레시피로 맞추기</div>
            <div className="mt-1 text-sm text-mammoth-sub">재료 순서를 보고 메뉴 이름을 골라요</div>
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const correct = answers.filter(({ q, chosen }) => q.answer === chosen).length;
    const wrong = answers.filter(({ q, chosen }) => q.answer !== chosen);
    const pct = Math.round((correct / answers.length) * 100);

    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <h2 className="text-2xl font-extrabold text-mammoth-ink">결과</h2>
        <div className="rounded-[22px] bg-white p-8 text-center shadow-sm">
          <div className="text-5xl font-extrabold text-mammoth-brand">{pct}%</div>
          <div className="mt-2 text-sm text-mammoth-sub">
            {correct}/{answers.length} 정답
          </div>
        </div>

        {wrong.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-mammoth-ink">오답 노트</h3>
            {wrong.map(({ q, chosen }) => (
              <div key={q.menuName} className="rounded-2xl border border-mammoth-line bg-white p-4 space-y-2">
                <p className="text-sm text-mammoth-sub">{q.prompt}</p>
                {q.hint && (
                  <p className="rounded-xl bg-mammoth-bg px-3 py-2 font-mono text-xs text-mammoth-ink">{q.hint}</p>
                )}
                <p className="text-sm">
                  <span className="text-red-500">내 답: </span>{chosen}
                </p>
                <p className="text-sm font-semibold text-mammoth-new">
                  정답: {q.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => start(quizType)}
            className="flex-1 rounded-full bg-mammoth-brand py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            다시 풀기
          </button>
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="flex-1 rounded-full border border-mammoth-line bg-white py-3 text-sm font-semibold text-mammoth-ink transition hover:border-mammoth-brand"
          >
            모드 선택
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="mx-auto max-w-lg space-y-5 py-8">
      <div className="flex items-center gap-4">
        <span className="shrink-0 text-sm text-mammoth-sub">
          {current + 1} / {questions.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mammoth-line">
          <div
            className="h-full rounded-full bg-mammoth-brand transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-[22px] bg-white p-6 shadow-sm space-y-3">
        <p className="text-base font-bold text-mammoth-ink">{q.prompt}</p>
        {q.hint && (
          <p className="rounded-xl bg-mammoth-bg px-4 py-3 font-mono text-sm text-mammoth-ink">
            {q.hint}
          </p>
        )}
      </div>

      <div className="grid gap-3">
        {q.choices.map((choice) => {
          let cls =
            "rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition";
          if (selected) {
            if (choice === q.answer) {
              cls += " border-mammoth-new bg-mammoth-newBg text-mammoth-new";
            } else if (choice === selected) {
              cls += " border-red-300 bg-red-50 text-red-600";
            } else {
              cls += " border-mammoth-line bg-white text-mammoth-sub";
            }
          } else {
            cls += " border-mammoth-line bg-white text-mammoth-ink hover:border-mammoth-brand";
          }
          return (
            <button
              type="button"
              key={choice}
              onClick={() => choose(choice)}
              disabled={!!selected}
              className={cls}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          type="button"
          onClick={next}
          className="w-full rounded-full bg-mammoth-brand py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {current + 1 < questions.length ? "다음 문제 →" : "결과 보기"}
        </button>
      )}
    </div>
  );
}
