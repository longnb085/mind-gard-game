
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ZenScapeProps {
  onExit: () => void;
}

const ZenScape: React.FC<ZenScapeProps> = ({ onExit }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateZenArt = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);

    try {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }

      // Re-create instance to get the latest key from session
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `A hyper-realistic, peaceful, high-detail cinematic landscape for meditation: ${prompt}. Artistic style: 8k resolution, ethereal lighting, soft focus, zen atmosphere.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "2K"
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) setError("The AI could not visualize this calm. Try different words.");

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
      setError("Error: " + (err.message || "The cosmos is currently noisy. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          <i className="fas fa-chevron-left"></i> Back to Hub
        </button>
        <div className="text-emerald-400 font-orbitron text-sm flex items-center gap-2">
           <i className="fas fa-leaf animate-pulse"></i> Zen Mode Active
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-2xl bg-slate-900/40 p-1">
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center rounded-2xl overflow-hidden">
          {image ? (
            <img src={image} alt="Zen Scape" className="w-full h-full object-cover animate-in fade-in duration-1000" />
          ) : (
            <div className="text-center p-12">
              <i className="fas fa-mountain-sun text-6xl text-slate-800 mb-6"></i>
              <p className="text-slate-500 font-medium">Describe your peaceful escape...</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-emerald-400 font-orbitron text-sm tracking-widest animate-pulse">MANIFESTING TRANQUILITY...</p>
              <p className="text-slate-500 text-xs mt-2">Gemini 3 Pro is crafting your 2K escape</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex gap-4">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateZenArt()}
            placeholder="e.g., A rainy Cyberpunk balcony overlooking a neon garden"
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <button 
            onClick={generateZenArt}
            disabled={loading || !prompt}
            className="px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 font-bold shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all disabled:opacity-50"
          >
            CREATE
          </button>
        </div>
        
        {error && <p className="text-rose-400 text-center text-sm">{error}</p>}
        
        <div className="flex justify-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
           <span><i className="fas fa-info-circle mr-1"></i> Requires Paid API Key for 2K Imagery</span>
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-slate-300">Billing Docs</a>
        </div>
      </div>
    </div>
  );
};

export default ZenScape;
