import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/scam-guardian/analyze", async (req, res) => {
  const { content } = req.body as { content?: string };

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "Content is required." });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are SecureShield's Scam Guardian AI. Analyze the provided text, URL, or message for scams, phishing, malware links, social engineering, or online threats.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "status": "safe" | "suspicious" | "dangerous",
  "score": <number 0-100 threat score>,
  "reason": "<short headline summary>",
  "details": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "recommendation": "<one actionable sentence telling the user what to do>"
}

Guidelines:
- score 0-25: safe, status "safe"
- score 26-65: suspicious, status "suspicious"  
- score 66-100: dangerous, status "dangerous"
- Be precise and technical. Mention specific red flags you detect.
- If it is clearly safe (a normal sentence, known safe URL, legitimate business), say so confidently.`
        },
        {
          role: "user",
          content: `Analyze this for scams and threats:\n\n${content.slice(0, 4000)}`
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid AI response format");
      }
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Scam guardian analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
