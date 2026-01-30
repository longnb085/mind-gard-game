
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface MindSparksProps {
  onExit: () => void;
}

const MindSparks: React.FC<MindSparksProps> = ({ onExit }) => {
  const [riddle, setRiddle] = useState<{ q: string, a: string, hint: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const fetchRiddle = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    setGuess('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a clever but short logic riddle for a 1-minute break. Provide the question, the one-word answer, and a small hint. Output as JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              a: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["q", "a", "hint"]
          }
        }
      });
      setRiddle(JSON.parse(response.text || '{}'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiddle();
  }, [fetchRiddle]);

  const checkAnswer = () => {
    if (guess.toLowerCase().trim() === riddle?.a.toLowerCase().trim()) {
      setScore(s => s + 50);
      setRevealed(true);
    } else {
      alert("Not quite! Try again or reveal the answer.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
        <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-orbitron">
          IQ Points: {score}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-3xl mb-4">
          <i className="fas fa-brain"></i>
        </div>

        {loading ? (
          <div className="space-y-4">
             <div className="h-4 w-64 bg-slate-800 animate-pulse rounded"></div>
             <div className="h-4 w-48 bg-slate-800 animate-pulse rounded mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {riddle?.q}
            </h2>
            
            {!revealed ? (
              <div className="space-y-4">
                <input 
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="The answer is..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-6 py-3 text-center text-xl focus:border-amber-500 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={checkAnswer} className="flex-1 bg-amber-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors">
                    SOLVE
                  </button>
                  <button onClick={() => setRevealed(true)} className="px-6 py-3 border border-slate-700 rounded-xl text-slate-500 hover:text-slate-300">
                    GIVE UP
                  </button>
                </div>
                <p className="text-xs text-slate-600 italic">Hint: {riddle?.hint}</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in">
                <div className="text-4xl font-orbitron font-bold text-amber-400 uppercase">
                  {riddle?.a}
                </div>
                <button onClick={fetchRiddle} className="px-8 py-3 bg-slate-800 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors">
                  NEXT SPARK
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindSparks;
