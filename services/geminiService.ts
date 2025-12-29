import { GoogleGenAI, Tool } from "@google/genai";
import { Lead, Message, Role, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || '';

// We create a fresh instance per call to ensure latest config if needed, 
// though for this app a singleton pattern or creating inside functions works.
// The guide recommends creating new instances for ensuring API key currency if it changes,
// but for environment variable keys, it's static.

export const generateLeads = async (
  query: string, 
  location: string, 
  radius: number,
  userLat?: number,
  userLng?: number
): Promise<{ text: string; leads: Lead[]; groundingSources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Model for Search/Maps grounding
  const modelId = "gemini-2.5-flash";

  const tools: Tool[] = [
    { googleSearch: {} },
    { googleMaps: {} }
  ];
  
  const toolConfig: any = {};
  if (userLat && userLng) {
    toolConfig.retrievalConfig = {
      latLng: {
        latitude: userLat,
        longitude: userLng
      }
    };
  }

  const prompt = `
    I need you to act as an Enterprise Lead Generator.
    Task: Find businesses matching "${query}" in or near "${location}".
    Range: Approximately ${radius} km.
    
    Instructions:
    1. Use Google Maps to find as many entities as possible matching the criteria.
    2. For EVERY entity found, use Google Search to find their website, email, and phone number if not provided by Maps.
    3. CRITICAL: You MUST include every single business found in the final JSON array. If you find 20 businesses, the JSON array must contain 20 objects. Do not summarize or omit any found businesses.
    
    Output Format:
    Return the response as a valid JSON array of objects.
    Each object must have these keys: "name", "address", "website", "email", "phone", "type", "rating".
    If a field is not found, use null or an empty string.
    
    After the JSON, provide a brief summary text analyzing the quality of these leads.
    
    CRITICAL: Ensure the JSON is valid. Wrap the JSON block in \`\`\`json ... \`\`\`.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools,
        toolConfig: toolConfig.retrievalConfig ? toolConfig : undefined,
        temperature: 0.2, // Low temperature for factual data
      }
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract Sources
    const sources: GroundingSource[] = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        sources.push({ title: chunk.web.title || "Web Source", uri: chunk.web.uri });
      }
      if (chunk.maps?.uri) { // Maps logic if available in chunk structure
         sources.push({ title: chunk.maps.title || "Google Maps", uri: chunk.maps.uri });
      }
    });

    // Parse JSON
    let leads: Lead[] = [];
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        leads = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON leads", e);
      }
    } else {
        // Fallback: try to find array in text even without code blocks
        const openBracket = text.indexOf('[');
        const closeBracket = text.lastIndexOf(']');
        if (openBracket !== -1 && closeBracket !== -1) {
            try {
                leads = JSON.parse(text.substring(openBracket, closeBracket + 1));
            } catch (e) {
                console.error("Fallback JSON parse failed", e);
            }
        }
    }

    // Clean up text to remove the big JSON block for the summary display
    const summary = text.replace(/```json[\s\S]*?```/g, '').trim();

    return {
      text: summary || "Leads generated successfully. See the table below.",
      leads,
      groundingSources: sources
    };

  } catch (error) {
    console.error("Error generating leads:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  history: Message[], 
  newMessage: string,
  currentLeadsContext: Lead[],
  image?: string // Base64
): Promise<{ text: string; groundingSources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const modelId = "gemini-3-pro-preview"; // Advanced reasoning model

  // Build History
  // We need to convert our Message type to the format expected by the API if using chat,
  // OR we can just feed it as a single big prompt with context if we want stateless simplicity,
  // but `chats.create` is better for true session history.
  
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  // Context System Instruction
  let systemInstruction = `You are an intelligent Enterprise AI Assistant.
  You help users analyze business leads, draft emails, and answer questions.
  `;

  if (currentLeadsContext.length > 0) {
    systemInstruction += `
    Current Leads Context (JSON):
    ${JSON.stringify(currentLeadsContext.slice(0, 20))}
    
    Use this context to answer questions about specific businesses, draft outreach emails, or compare them.
    `;
  }

  // Create Chat
  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }] // Enable search for the chatbot too for fresh info
    },
    history: chatHistory
  });

  const parts: any[] = [];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg", // Assuming jpeg for simplicity, or we could detect
        data: image
      }
    });
  }
  parts.push({ text: newMessage });

  const result = await chat.sendMessage({
    message: { parts } // Pass correct structure for message
  });

  const text = result.text || "";
  
  const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = [];
  groundingChunks.forEach((chunk: any) => {
    if (chunk.web?.uri) {
      sources.push({ title: chunk.web.title || "Web Source", uri: chunk.web.uri });
    }
  });

  return {
    text,
    groundingSources: sources
  };
};