import { GoogleGenAI, Type } from "@google/genai";
import { Person, PreferenceType, GiftSuggestion } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to format person data for the prompt
const formatPersonProfile = (person: Person): string => {
  const likes = person.preferences.filter(p => p.type === PreferenceType.LIKE).map(p => `${p.item} (${p.category})`).join(', ');
  const dislikes = person.preferences.filter(p => p.type === PreferenceType.DISLIKE).map(p => `${p.item} (${p.category})`).join(', ');
  const allergies = person.preferences.filter(p => p.type === PreferenceType.ALLERGY).map(p => `${p.item}`).join(', ');

  return `
    Name: ${person.name}
    Relationship: ${person.relationship}
    Likes: ${likes || 'None recorded'}
    Dislikes: ${dislikes || 'None recorded'}
    Allergies/Restrictions: ${allergies || 'None recorded'}
  `;
};

export const generateGiftSuggestions = async (person: Person): Promise<GiftSuggestion[]> => {
  if (!apiKey) return [];

  const profile = formatPersonProfile(person);
  const prompt = `Based on the following profile, suggest 5 creative and thoughtful gift ideas. Return the response in JSON format.
  
  Profile:
  ${profile}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the gift" },
              description: { type: Type.STRING, description: "Why this is a good gift for them" },
              estimatedPrice: { type: Type.STRING, description: "Rough price range (e.g. $20-$50)" }
            },
            required: ["name", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as GiftSuggestion[];
  } catch (error) {
    console.error("Error generating gifts:", error);
    return [];
  }
};

export const generateProfileSummary = async (person: Person): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const profile = formatPersonProfile(person);
  const prompt = `Write a short, warm, one-paragraph summary of this person's preferences in Chinese (Simplified). Highlight their main interests and any critical allergies.
  
  Profile:
  ${profile}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法生成摘要。";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "生成摘要时出错。";
  }
};