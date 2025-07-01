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

export async function getCollegeRecommendations(
  query: string,
  colleges: any[]
): Promise<any[]> {
  try {
    const systemPrompt = `You are an educational consultant helping students find the best colleges in India. Based on the user's query and the provided college database, recommend ALL relevant colleges (don't filter out any that could be suitable).

Analyze the user's query for:
- Academic interests (engineering, medicine, business, arts, etc.)  
- Location preferences
- Budget constraints
- Career goals
- Entrance exam preferences

IMPORTANT: Always recommend AT LEAST 3-5 colleges from the provided list, even if the match isn't perfect. Students need options to choose from.

Return a JSON array of college IDs ranked by relevance to the query, with reasoning for each recommendation.

Format: 
{
  "recommendations": [
    {
      "id": 1,
      "score": 95,
      "reasoning": "Perfect match for engineering with excellent ranking and reasonable fees"
    },
    {
      "id": 2,
      "score": 80,
      "reasoning": "Good alternative with strong programs in the field"
    }
  ]
}`;

    const collegeData = colleges.map(c => ({
      id: c.id,
      name: c.name,
      location: c.location,
      courses: c.courses,
      fees: c.fees,
      ranking: c.ranking,
      entranceExam: c.entranceExam,
      description: c.description
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  score: { type: "number" },
                  reasoning: { type: "string" }
                },
                required: ["id", "score", "reasoning"]
              }
            }
          },
          required: ["recommendations"]
        }
      },
      contents: `User Query: "${query}"\n\nAvailable Colleges: ${JSON.stringify(collegeData)}\n\nProvide personalized college recommendations based on the query.`
    });

    const rawJson = response.text;
    console.log(`AI College Recommendations: ${rawJson}`);

    if (rawJson) {
      const result = JSON.parse(rawJson);
      
      if (!result.recommendations || !Array.isArray(result.recommendations)) {
        throw new Error("Invalid response format from Gemini");
      }

      // Sort by score and return recommended college IDs
      const sortedRecommendations = result.recommendations
        .sort((a: any, b: any) => b.score - a.score)
        .map((rec: any) => rec.id);

      // Return colleges in recommended order, or all colleges if no recommendations
      if (sortedRecommendations.length === 0) {
        console.log("No AI recommendations, returning all colleges");
        return colleges;
      }
      
      const recommendedColleges = sortedRecommendations.map((id: number) => 
        colleges.find(c => c.id === id)
      ).filter(Boolean);
      
      // If we have fewer recommendations than available colleges, add remaining colleges
      if (recommendedColleges.length < colleges.length) {
        const recommendedIds = new Set(sortedRecommendations);
        const remainingColleges = colleges.filter(c => !recommendedIds.has(c.id));
        return [...recommendedColleges, ...remainingColleges];
      }
      
      return recommendedColleges;
    } else {
      throw new Error("Empty response from Gemini");
    }

  } catch (error) {
    console.error("Error getting college recommendations:", error);
    // Return original colleges if AI fails
    return colleges;
  }
}
