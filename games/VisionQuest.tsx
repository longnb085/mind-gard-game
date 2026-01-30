
import React, { useState, useEffect, useCallback } from 'react';
import { generateImageRiddle } from '../services/geminiService';

interface VisionQuestProps {
  onExit: () => void;
}

const VisionQuest: React.FC<VisionQuestProps> = ({ onExit }) => {
  const [loading, setLoading] = useState(true);
  const [riddle, setRiddle] = useState<{ word: string, imageUrl: string } | null>(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [score, setScore] = useState(0);

  const loadNewRiddle = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setGuess('');
    try {
      const data = await generateImageRiddle();
      setRiddle(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewRiddle();
  }, [loadNewRiddle]);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riddle) return;

    if (guess.toLowerCase().trim() === riddle.word.toLowerCase().trim()) {
      setFeedback({ type: 'success', message: `Brilliant! The word was "${riddle.word}"` });
      setScore(s => s + 100);
      setTimeout(() => loadNewRiddle(), 2000);
    } else {
      setFeedback({ type: 'error', message: "Not quite... try looking at the details!" });
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          <i className="fas fa-chevron-left"></i> Exit to Lobby
        </button>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-slate-500 mr-2">Score:</span>
          <span className="font-orbitron font-bold text-cyan-400">{score}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
        <div className="relative aspect-square glass rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-slate-400 font-orbitron animate-pulse">GENERATING REALITY...</p>
            </div>
          ) : (
            <img src={riddle?.imageUrl} alt="AI Riddle" className="w-full h-full object-cover animate-in fade-in zoom-in" />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-orbitron font-bold mb-6">Visual Enigma</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Gemini has conceptualized a hidden word into a unique visual form. Study the image carefully. What core concept is the AI trying to convey?
          </p>

          <form onSubmit={handleGuess} className="space-y-4">
            <input 
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess..."
              disabled={loading}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !guess}
              className="w-full game-gradient py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              SUBMIT ANSWER
            </button>
          </form>

          {feedback && (
            <div className={`mt-6 p-4 rounded-xl text-center font-bold animate-bounce ${
              feedback.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {feedback.message}
            </div>
          )}

          <div className="mt-12 p-6 glass rounded-2xl border-l-4 border-indigo-500">
            <h4 className="font-bold text-sm text-slate-300 mb-2 uppercase tracking-wider">Hint</h4>
            <p className="text-slate-500 italic text-sm">
              AI images are often metaphorical. Look for patterns, colors, and lighting that suggest an emotion or an object.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionQuest;
