
import { GoogleGenAI } from "@google/genai";
import { EditRequest } from "../types.ts";

export class GeminiService {
  async editImage({ image, prompt, mimeType }: EditRequest): Promise<string> {
    // Inizializza l'istanza al momento della chiamata per usare la chiave più recente
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key non trovata. Controlla la configurazione.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Nessuna risposta generata dall'AI.");
    }

    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("L'AI non ha restituito una nuova immagine.");
  }
}

export const geminiService = new GeminiService();
