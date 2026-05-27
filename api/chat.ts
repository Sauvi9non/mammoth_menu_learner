import Anthropic from "@anthropic-ai/sdk";

type Message = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(menus: unknown[]): string {
  return `너는 매머드 익스프레스 메뉴 학습 도우미야. 카페 알바 신규 입사자가 메뉴를 공부할 수 있도록 도와줘.

아래는 매머드 익스프레스 음료 메뉴 데이터야 (교육 전 추정 데이터 — 공식 레시피와 다를 수 있어):

${JSON.stringify({ menus }, null, 2)}

규칙:
- 데이터에 없는 내용은 솔직하게 "데이터에 없어요"라고 말해줘
- uncertain: true이거나 steps가 비어있는 항목은 "교육 때 확인 필요"라고 표시해줘
- 친근하고 간결하게 답해줘 (한국어)
- 재료 비교, 카테고리 설명, 레시피 요약 등 학습에 도움이 되는 방향으로 답해줘`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, menus } = req.body as { messages: Message[]; menus: unknown[] };

  if (!Array.isArray(messages) || !Array.isArray(menus)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server: ANTHROPIC_API_KEY not set" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSystemPrompt(menus),
      messages,
    });
    const reply = response.content[0].type === "text" ? response.content[0].text : "";
    return res.status(200).json({ reply });
  } catch {
    return res.status(500).json({ error: "Anthropic API 호출에 실패했어요." });
  }
}
