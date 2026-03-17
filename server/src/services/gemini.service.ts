import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export async function getGeminiReply(input: {
  courseTitle: string;
  question: string;
  professorName?: string;
}) {
  const prompt = `
You are a helpful, concise educational assistant.
Course: ${input.courseTitle}
Professor: ${input.professorName ?? "Unknown"}

Student question:
${input.question}

Rules:
- Be supportive and educational.
- Keep the response concise.
- Give practical next steps.
- Avoid making things up.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "I could not generate a response right now.";
}