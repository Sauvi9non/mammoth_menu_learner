import { useEffect, useRef, useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import type { Menu } from "../types";

type Message = { role: "user" | "assistant"; content: string };

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

function buildSystemPrompt(menus: Menu[]): string {
  return `너는 매머드 익스프레스 메뉴 학습 도우미야. 카페 알바 신규 입사자가 메뉴를 공부할 수 있도록 도와줘.

아래는 매머드 익스프레스 음료 메뉴 데이터야 (교육 전 추정 데이터 — 공식 레시피와 다를 수 있어):

${JSON.stringify({ menus }, null, 2)}

규칙:
- 데이터에 없는 내용은 솔직하게 "데이터에 없어요"라고 말해줘
- uncertain: true이거나 steps가 비어있는 항목은 "교육 때 확인 필요"라고 표시해줘
- 친근하고 간결하게 답해줘 (한국어)
- 재료 비교, 카테고리 설명, 레시피 요약 등 학습에 도움이 되는 방향으로 답해줘`;
}

type Props = { menus: Menu[] };

export default function LLMChat({ menus }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading || !API_KEY) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
      const res = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: buildSystemPrompt(menus),
        messages: newMessages,
      });
      const reply = res.content[0].type === "text" ? res.content[0].text : "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "오류가 발생했어요. API 키와 네트워크 연결을 확인해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!API_KEY) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="rounded-[22px] border border-mammoth-warnBg bg-mammoth-warnBg p-6">
          <p className="font-bold text-mammoth-warn">API 키가 없어요</p>
          <p className="mt-2 text-sm text-mammoth-warn">
            프로젝트 루트에 <code className="rounded bg-white/60 px-1 font-mono">.env</code> 파일을 만들고 아래 내용을 추가한 뒤, dev 서버를 재시작해주세요.
          </p>
          <code className="mt-3 block rounded-xl bg-white/70 px-4 py-3 font-mono text-xs text-mammoth-ink">
            VITE_ANTHROPIC_API_KEY=sk-ant-...
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 py-8" style={{ height: "calc(100vh - 220px)" }}>
      <div>
        <h2 className="text-2xl font-extrabold text-mammoth-ink">메뉴 Q&amp;A</h2>
        <p className="mt-1 text-sm text-mammoth-sub">
          메뉴에 대해 자유롭게 물어보세요. 예: "꿀 들어간 메뉴 다 알려줘"
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 rounded-[22px] border border-mammoth-line bg-white p-5">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-mammoth-sub">
            아직 대화가 없어요. 메뉴에 대해 무엇이든 물어보세요!
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-mammoth-brand text-white"
                  : "bg-mammoth-bg text-mammoth-ink"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-mammoth-bg px-4 py-3 text-sm text-mammoth-sub">
              생각 중...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="질문을 입력하세요..."
          disabled={loading}
          className="flex-1 rounded-full border border-mammoth-line bg-white px-5 py-3 text-sm text-mammoth-ink outline-none transition focus:border-mammoth-brand disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="rounded-full bg-mammoth-brand px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>
  );
}
