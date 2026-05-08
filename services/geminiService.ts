
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationContext {
  city?: string;
  brand?: string;
  magazine?: string;
  platform?: string;
  category: string;
  query?: string;
  photographer?: { name: string; style: string };
}

export const generatePaparazziShot = async (context: GenerationContext) => {
  const ai = getAIClient();
  let specificPrompt = '';

  const magazines = ['Vogue', 'Elle', 'GQ', 'W'];
  const social = ['Facebook', 'Instagram', 'TikTok', 'Pinterest'];

  if (context.category === 'Master Photographers') {
    specificPrompt = `A high-fashion masterpiece in the style of legendary fashion photographers (e.g., Avedon, Meisel, or Newton). 
    Aesthetic: Dramatic shadows, iconic composition, heritage luxury garments. Photorealistic, editorial perfection.`;
  } else if (social.includes(context.category)) {
    specificPrompt = `A high-energy, candid street style photo as seen on ${context.category}. 
    Trending urban look, natural golden hour lighting, raw but luxurious feel. Focus on modern textures and bold accessories. Influencer vibes.`;
  } else if (context.category === 'You Got The Look') {
    specificPrompt = `An ultra-glamorous, close-up "beauty and fashion" shot of a trendsetter walking the red carpet or leaving a private event. Stunning makeup, signature luxury jewelry, and a confident "it-girl/boy" expression. Sharp, vibrant, cinematic flashes.`;
  } else if (context.category === 'Spring / Summer' || context.category === 'Fall / Winter') {
    const season = context.category;
    specificPrompt = `A high-fidelity runway capture for the ${season} collection. Focused on the latest catalog silhouettes, designer fabrics, and pristine runway lighting. Leads the viewer into the seasonal vision of a major fashion house.`;
  } else if (context.category === 'Runway Archives (10y)') {
    specificPrompt = `A nostalgic yet high-definition heritage runway shot from the last decade of global fashion weeks (Paris, Milan, London). Vintage textures, iconic designer pieces that defined an era, and a classic professional runway atmosphere.`;
  } else if (magazines.includes(context.category)) {
    specificPrompt = `A high-fashion editorial photo in the style of ${context.category} magazine. High-contrast lighting, sophisticated pose, luxury designer clothes, professional studio background, iconic masthead style.`;
  } else if (context.category === 'Fashion Feeds') {
    specificPrompt = `A polished, highly-stylized lookbook image suitable for a premium fashion feed. Clean composition, focus on garment construction and brand aesthetic.`;
  } else {
    specificPrompt = `A high-end paparazzi street style photo from a major fashion capital. A celebrity walking past a crowd, wearing avant-garde luxury fashion. Sharp focus, motion blur, 8k cinematic lighting.`;
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: specificPrompt }] },
    config: {
      imageConfig: { aspectRatio: "3:4", imageSize: "1K" },
      tools: [{ googleSearch: {} }] 
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        url: `data:image/png;base64,${part.inlineData.data}`,
        prompt: specificPrompt,
        groundingChunks
      };
    }
  }
  throw new Error("Failed to capture shot");
};

export const compositeImage = async (base64Image: string, target: 'magazine' | 'runway', selection: string) => {
  const ai = getAIClient();
  const base64Data = base64Image.split(',')[1];
  
  let prompt = '';
  if (target === 'magazine') {
    prompt = `Composite this person onto the iconic front cover of ${selection} magazine. Add masterful high-fashion typography and professional headlines. Impeccable editorial lighting.`;
  } else {
    prompt = `Place this person into a cinematic high-fashion tracking shot walking the ${selection} runway. Perfect integration as the lead model.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Data
          }
        },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "3:4" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to composite image");
};

export const analyzeFashionTrend = async (prompt: string, agentName: string, personaStyle: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this fashion scene: "${prompt}". You are ${agentName}, ${personaStyle}. Identify 3 items, trends, and regional buying variations. Provide a verdict. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifiedItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                brandHint: { type: Type.STRING },
                suggestedAcquisition: { type: Type.STRING }
              },
              required: ["name", "category", "brandHint", "suggestedAcquisition"]
            }
          },
          regionalTrends: {
            type: Type.OBJECT,
            properties: {
              Aspen: { type: Type.STRING },
              Tokyo: { type: Type.STRING },
              London: { type: Type.STRING }
            }
          },
          agentVerdict: { type: Type.STRING }
        },
        required: ["identifiedItems", "regionalTrends", "agentVerdict"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSpeech = async (text: string, voiceName: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this fashion verdict elegantly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const getConsultation = async (agentName: string, personaStyle: string, question: string, history: {role: string, text: string}[], imageBase64?: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `You are ${agentName}, ${personaStyle}. Be professional, elite, and provide expert styling advice.` }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: 'image/png'
      }
    });
  }

  const contents = [
    { role: 'user', parts: [{ text: "Context: Neural fashion studio session." }] },
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: question }, ...(imageBase64 ? [parts[1]] : [])] }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents as any,
  });

  return response.text;
};

export function decodeBase64Audio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
