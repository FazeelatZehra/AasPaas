import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateBusinessDescription(name: string, category: string, location: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional, inviting, and short (2-3 sentences) business description for a local business named "${name}" in the category "${category}" located at "${location}". Focus on hyperlocal appeal.`,
  });
  return response.text?.trim() || "";
}

export async function parseUserQuery(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract the intent from this hyperlocal marketplace query: "${query}". 
    Identify category, budget (if any), and urgency. 
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "The business category (e.g., Food, Repair, Service)" },
          budget: { type: Type.NUMBER, description: "Maximum budget mentioned, or null" },
          urgency: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Urgency level" },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Search keywords" }
        },
        required: ["category", "urgency", "keywords"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function parseRequestText(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this user request for a local service/product: "${text}". 
    Extract structured data and suggest a clearer title and description.
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedTitle: { type: Type.STRING },
          suggestedDescription: { type: Type.STRING },
          category: { type: Type.STRING },
          budget: { type: Type.NUMBER },
          urgency: { type: Type.STRING, enum: ["low", "medium", "high"] }
        },
        required: ["suggestedTitle", "suggestedDescription", "category", "urgency"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}
