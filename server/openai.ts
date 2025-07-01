import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export async function generateEnglishTest(
  difficulty: "beginner" | "intermediate" | "advanced",
  duration: number, // in minutes
  questionCount?: number
): Promise<TestQuestion[]> {
  const numQuestions = questionCount || Math.min(Math.floor(duration / 2), 25); // 2 minutes per question, max 25
  
  const difficultyPrompts = {
    beginner: "basic grammar, simple vocabulary, present/past tense, basic sentence structure",
    intermediate: "complex grammar, intermediate vocabulary, all tenses, conditional sentences, phrasal verbs",
    advanced: "advanced grammar, sophisticated vocabulary, complex sentence structures, idiomatic expressions, advanced writing techniques"
  };

  try {
    const systemPrompt = `You are an expert English language teacher. Generate ${numQuestions} multiple choice English test questions for ${difficulty} level students. Focus on: ${difficultyPrompts[difficulty]}. 

Each question should have exactly 4 options (A, B, C, D) with only one correct answer. Include a brief explanation for the correct answer.

Return your response as a JSON object with this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct: { type: "number" },
                  explanation: { type: "string" }
                },
                required: ["id", "question", "options", "correct", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: `Generate ${numQuestions} English test questions for ${difficulty} level, suitable for a ${duration}-minute test.`
    });

    const rawJson = response.text;
    console.log(`Generated test questions: ${rawJson}`);

    if (rawJson) {
      const result = JSON.parse(rawJson);
      
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("Invalid response format from Gemini");
      }

      return result.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation
      }));
    } else {
      throw new Error("Empty response from Gemini");
    }

  } catch (error) {
    console.error("Error generating test questions:", error);
    throw new Error("Failed to generate test questions: " + (error as Error).message);
  }
}
