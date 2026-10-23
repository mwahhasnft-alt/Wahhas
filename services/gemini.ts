import { GoogleGenAI, Chat, Content, Modality } from "@google/genai";
import { PropertyService } from "./propertyService";
import { Message, ChatMode, UserRole, GroundingSource } from "../types";
import { getEnv } from "../utils/env";
import { ScienceService } from "./scienceService";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;
let currentMode: ChatMode = 'smart';
let currentRole: UserRole = 'guest';

/**
 * Automatically determine the optimal AI reasoning and grounding mode
 * based on the user's message context, terminology, and intent.
 * Evaluates spatial / maps queries, scientific / soil questions,
 * real-time regulatory / market updates, and deep financial / ROI modeling.
 */
export const autoDetectChatMode = (query: string, hasImage?: boolean): ChatMode => {
  if (!query) return 'smart';
  const q = query.toLowerCase();

  // 1. Science, Geotechnics, Soil Mechanics & Environmental (Europe PMC)
  const scienceKeywords = [
    'soil', 'geotech', 'foundation', 'strata', 'najd limestone', 'mostadam',
    'green building', 'heat island', 'solar radiation', 'photovoltaic', 'sedimentary',
    'bearing capacity', 'settlement', 'subsidence', 'sbc', 'saudi building code',
    'تربة', 'جيوتقني', 'أساسات', 'صخور', 'الحجر الجيري', 'مستدام', 'كود البناء',
    'الجزيرة الحرارية', 'الإشعاع الشمسي', 'فحص التربة', 'بيئي', 'استدامة', 'هبوط التربة'
  ];
  if (scienceKeywords.some(kw => q.includes(kw))) {
    return 'science';
  }

  // 2. Spatial, Navigation & Google Maps Grounding
  const mapsKeywords = [
    'where is', 'where are', 'location of', 'near', 'nearby', 'directions to', 'map of',
    'coordinates', 'district', 'neighborhood', 'how to get to', 'distance between',
    'schools near', 'metro near', 'hospital near', 'transit', 'highway', 'street',
    'أين يقع', 'موقع', 'خريطة', 'أين توجد', 'قريب من', 'بالقرب من', 'شارع',
    'طريق', 'أحياء الرياض', 'حي الملقا', 'حي النرجس', 'حي الياسمين', 'حي الصحافة',
    'حي العليا', 'حي حطين', 'حي العارض', 'شمال الرياض', 'شرق الرياض', 'المسافة بين', 'محطة مترو'
  ];
  if (mapsKeywords.some(kw => q.includes(kw))) {
    return 'maps';
  }

  // 3. Real-time Search Grounding (breaking news, current rates, SAMA, official decrees)
  const searchKeywords = [
    'today', 'news', 'latest', 'current price', 'interest rate', 'saudi central bank',
    'sama rate', 'new regulation', 'decree', '2026', 'update', 'announced',
    'أخبار', 'اليوم', 'أحدث', 'الأسعار اليوم', 'سعر الفائدة', 'البنك المركزي',
    'ساما', 'الأنظمة الجديدة', 'قرار', 'إعلان', 'آخر التطورات', 'البورصة العقارية اليوم'
  ];
  if (searchKeywords.some(kw => q.includes(kw))) {
    return 'search';
  }

  // 4. Deep Thinking & Financial Modeling, ROI, Valuation & Yields
  const thinkingKeywords = [
    'roi', 'yield', 'calculate', 'financial model', 'cash flow', 'feasibility',
    'appraisal formula', 'cap rate', 'discounted', 'irr', 'amortization', 'mortgage',
    'حساب العائد', 'دراسة جدوى', 'عائد استثماري', 'نموذج مالي', 'تدفقات نقدية',
    'مقارنة استثمارية', 'تقييم شامل', 'تحليل مخاطر', 'حسبة التمويل', 'قرض عقاري'
  ];
  if (thinkingKeywords.some(kw => q.includes(kw))) {
    return 'thinking';
  }

  // Default to High-Performance Smart reasoning
  return 'smart';
};

export const initializeGemini = () => {
  const apiKey = getEnv("API_KEY") || getEnv("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("API Key is missing!");
    return;
  }
  ai = new GoogleGenAI({ apiKey });
};

export const startChatSession = (historyMessages: Message[] = [], mode: ChatMode = 'smart', role: UserRole = 'guest') => {
  if (!ai) initializeGemini();
  // Preparing local chat state must not prevent the app from opening when
  // Gemini has not been configured. Sending a message validates it separately.
  if (!ai) {
    chatSession = null;
    return null;
  }

  currentMode = mode;
  currentRole = role;

  const history: Content[] = historyMessages
    .filter(msg => !msg.isStreaming && msg.content.trim() !== "")
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

  let modelName = 'gemini-3.8-flash';
  let config: any = {
    systemInstruction: PropertyService.getSystemPrompt(role),
    temperature: 0.7,
  };

  if (mode === 'fast') {
    modelName = 'gemini-3.1-flash-lite';
  } else if (mode === 'thinking') {
    modelName = 'gemini-3.8-flash';
    config = {
      ...config,
      thinkingConfig: { thinkingBudget: 16000 },
    };
  } else if (mode === 'search') {
    // Grounding with Google Search requires gemini-3.5-flash
    modelName = 'gemini-3.5-flash';
    config = {
      ...config,
      tools: [{ googleSearch: {} }],
    };
  } else if (mode === 'maps') {
    // Grounding with Google Maps requires gemini-3.5-flash with Riyadh coordinates
    modelName = 'gemini-3.5-flash';
    config = {
      ...config,
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: 24.7136, // Riyadh, Saudi Arabia
            longitude: 46.6753
          }
        }
      }
    };
  } else if (mode === 'science') {
    modelName = 'gemini-3.8-flash';
    config = {
      ...config,
      systemInstruction: `${PropertyService.getSystemPrompt(role)}\nYou are also a Senior Geotechnical & Environmental Scientist specializing in Saudi real estate, Riyadh geological formations (Najd limestone), Mostadam green building ratings, solar irradiance, and urban heat island mitigation. Provide scientific rigor and cite environmental benchmarks.`,
    };
  }

  chatSession = ai.chats.create({
    model: modelName,
    config: config,
    history: history
  });

  return chatSession;
};

export const getChatSession = (mode?: ChatMode): Chat => {
  if (!ai) initializeGemini();
  if (!ai) {
    const apiKey = getEnv("API_KEY") || getEnv("GEMINI_API_KEY");
    if (!apiKey) throw new Error("API Key not found in environment.");
    throw new Error("Failed to initialize Gemini AI.");
  }

  if (!chatSession || (mode && mode !== currentMode)) {
    startChatSession([], mode || 'smart', currentRole);
  }

  if (!chatSession) {
    throw new Error("Could not create chat session");
  }

  return chatSession;
};

export interface GeminiResponse {
  text: string;
  suggestions: string[];
  groundingSources?: GroundingSource[];
  scienceData?: any;
}

export const sendMessageToGemini = async (
  message: string,
  image?: string,
  history?: Message[],
  activeMode?: ChatMode
): Promise<GeminiResponse> => {
  if (!ai) initializeGemini();
  if (!ai) throw new Error("Gemini AI not initialized");

  const mode = activeMode || autoDetectChatMode(message, !!image);
  currentMode = mode;

  try {
    let text = "";
    let result: any;
    let scienceArticles: any[] = [];

    // If Science Mode: proactively search Europe PMC literature
    if (mode === 'science') {
      try {
        scienceArticles = await ScienceService.searchScientificLiterature(message, 3);
      } catch (err) {
        console.warn("Science literature query note:", err);
      }
    }

    // Multimodal image processing
    if (image && ai) {
      const contents: Content[] = history ? history
        .filter(msg => !msg.isStreaming && (msg.content.trim() !== "" || msg.image))
        .map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })) : [];

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      contents.push({
        role: 'user',
        parts: [
          { text: message },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
        ]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: PropertyService.getSystemPrompt(currentRole),
          temperature: 0.7
        }
      });

      result = response;
      text = result.text || "";
      chatSession = null;
    } else {
      // Direct session call or single-shot tool invocation for search/maps
      if (mode === 'maps') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: PropertyService.getSystemPrompt(currentRole),
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: 24.7136, // Riyadh
                  longitude: 46.6753
                }
              }
            }
          }
        });
        result = response;
        text = result.text || "";
      } else if (mode === 'search') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: PropertyService.getSystemPrompt(currentRole),
            tools: [{ googleSearch: {} }]
          }
        });
        result = response;
        text = result.text || "";
      } else if (mode === 'science' && scienceArticles.length > 0) {
        const scienceContext = scienceArticles.map(a => 
          `[Title: ${a.title} | Journal: ${a.journalTitle} (${a.pubYear}) | DOI: ${a.doi || 'N/A'} | Abstract: ${a.abstractText}]`
        ).join("\n");

        const promptWithScience = `${message}\n\n[Scientific Literature Context from Europe PMC]:\n${scienceContext}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptWithScience,
          config: {
            systemInstruction: `${PropertyService.getSystemPrompt(currentRole)}\nIncorporate insights from the scientific literature context when relevant. Mention peer-reviewed findings, environmental criteria, or engineering benchmarks.`,
          }
        });
        result = response;
        text = response.text || "";
      } else {
        const session = getChatSession(mode);
        result = await session.sendMessage({ message });
        text = result.text || "";
      }
    }

    // Extract Grounding Chunks (Web and Google Maps)
    const groundingSources: GroundingSource[] = [];
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        // Web Search Chunks
        if (chunk.web?.uri) {
          groundingSources.push({
            title: chunk.web.title || new URL(chunk.web.uri).hostname,
            url: chunk.web.uri,
            type: 'web'
          });
        }
        // Google Maps Chunks
        if (chunk.maps?.uri) {
          groundingSources.push({
            title: chunk.maps.title || 'Google Maps Location',
            url: chunk.maps.uri,
            type: 'maps'
          });
        }
      });
    }

    // Include Europe PMC scientific articles if present
    if (scienceArticles.length > 0) {
      scienceArticles.forEach(a => {
        groundingSources.push({
          title: a.title,
          url: a.url,
          type: 'science'
        });
      });
    }

    // Append formatted markdown sources if grounding sources exist
    if (groundingSources.length > 0) {
      const uniqueSources = new Map<string, GroundingSource>();
      groundingSources.forEach(s => {
        if (!uniqueSources.has(s.url)) uniqueSources.set(s.url, s);
      });

      const mapsSources = Array.from(uniqueSources.values()).filter(s => s.type === 'maps');
      const webSources = Array.from(uniqueSources.values()).filter(s => s.type === 'web');
      const scienceSourcesList = Array.from(uniqueSources.values()).filter(s => s.type === 'science');

      if (mapsSources.length > 0) {
        text += "\n\n📍 **Google Maps Locations & Grounding:**\n";
        mapsSources.forEach(s => {
          text += `• [${s.title}](${s.url})\n`;
        });
      }

      if (webSources.length > 0) {
        text += "\n\n🌐 **Google Search Verified Sources:**\n";
        webSources.forEach(s => {
          text += `• [${s.title}](${s.url})\n`;
        });
      }

      if (scienceSourcesList.length > 0) {
        text += "\n\n🔬 **Europe PMC Scientific Literature:**\n";
        scienceSourcesList.forEach(s => {
          text += `• [${s.title}](${s.url}) *(Peer-reviewed / Open Access)*\n`;
        });
      }
    }

    // Extract dynamic UI suggestions
    const suggestions: string[] = [];
    const suggestionRegex = /\[SUGGESTION:\s*(.*?)\]/g;
    let match;
    while ((match = suggestionRegex.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }
    text = text.replace(suggestionRegex, '').trim();

    return { 
      text, 
      suggestions,
      groundingSources,
      scienceData: scienceArticles.length > 0 ? scienceArticles : undefined
    };

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  if (!ai) initializeGemini();
  if (!ai) throw new Error("Gemini AI not initialized");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: base64Audio
            }
          },
          {
            text: "Transcribe the audio exactly as spoken in Arabic or English."
          }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  if (!ai) initializeGemini();
  if (!ai) throw new Error("Gemini AI not initialized");

  try {
    const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 1000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: "user",
          parts: [{ text: cleanText }]
        }
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;

  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};
