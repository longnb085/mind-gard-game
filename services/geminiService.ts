
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageRiddle = async () => {
  const ai = getAI();
  const themes = ['mythology', 'cyberpunk', 'nature', 'abstract art', 'space travel', 'steampunk'];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a short secret word (1 word only) and a creative prompt to generate an image describing that word without using the word itself. Theme: ${theme}. Return as JSON: { "word": "...", "prompt": "..." }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          prompt: { type: Type.STRING }
        },
        required: ["word", "prompt"]
      }
    }
  });

  const { word, prompt } = JSON.parse(response.text || '{}');

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  let imageUrl = '';
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return { word, imageUrl };
};

export const chatWithRPG = async (history: any[], userInput: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are an Infinite RPG Dungeon Master. Create immersive scenarios. Keep responses under 100 words. Always provide 3 distinct action choices for the user at the end of each turn.',
    }
  });

  const response = await chat.sendMessage({ message: userInput });
  return response.text;
};

// Audio helpers for Live API
export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encodeBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
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
};
