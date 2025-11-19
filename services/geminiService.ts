import { GoogleGenAI } from "@google/genai";
import { NewsResponse, NewsItem } from "../types";

const SYSTEM_INSTRUCTION = `
You are a professional AI News Editor for "bahaAİ".
Your goal is to provide a concise, engaging, and factual daily bulletin about Artificial Intelligence.
You MUST use the Google Search tool to find the absolute latest news for the given date.

You must return the result as a strictly valid JSON array. 
Do not include any markdown formatting (like \`\`\`json) outside of the specific content strings.

Structure:
[
  {
    "titleEn": "Headline in English",
    "contentEn": "Summary in English (use markdown for bolding **keywords** and lists)",
    "titleTr": "Headline translated to Turkish",
    "contentTr": "Summary translated to Turkish (use markdown for bolding **keywords** and lists)"
  }
]

Focus on these categories:
1. Headline News
2. New Features & Releases
3. Updates
4. Deals & Free Access
`;

export const fetchDailyNews = async (dateString: string): Promise<NewsResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Search for the latest AI news for today, ${dateString}. 
    Find at least 5 distinct and significant items.
    
    Return a JSON Array where each item contains the English version and a high-quality Turkish translation.
    
    Keys required per item:
    - titleEn (English Title)
    - contentEn (English Summary - concise, use bullet points if needed)
    - titleTr (Turkish Title)
    - contentTr (Turkish Summary - professional translation)
    
    Ensure the JSON is valid.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    let text = response.text || "[]";
    
    // Clean up potential markdown formatting from the LLM response to ensure valid JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the first '[' and last ']' to extract the array
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    let items: NewsItem[] = [];
    
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = text.substring(startIndex, endIndex + 1);
      try {
        items = JSON.parse(jsonString);
      } catch (e) {
        console.error("Failed to parse JSON news data", e);
        // Fallback or empty array
        items = [];
      }
    }

    // Extract sources from grounding metadata
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = rawChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        url: chunk.web.uri,
        title: chunk.web.title,
      }));

    // Deduplicate sources
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.url, item])).values()) as { url: string; title: string }[];

    return {
      items,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Failed to generate news bulletin.");
  }
};
