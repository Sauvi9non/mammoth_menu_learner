import { useEffect, useRef, useState } from "react";
import type { Menu } from "../types";

type Message = { role: "user" | "assistant"; content: string };

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
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, menus }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? "알 수 없는 오류가 발생했어요.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "오류가 발생했어요. 네트워크 연결을 확인해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
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
