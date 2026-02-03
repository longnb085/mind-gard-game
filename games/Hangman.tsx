
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface HangmanProps {
  onExit: () => void;
}

const Hangman: React.FC<HangmanProps> = ({ onExit }) => {
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(6);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const MAX_LIVES = 6;

  const fetchNewWord = useCallback(async () => {
    setLoading(true);
    setGuessedLetters([]);
    setLives(MAX_LIVES);
    setGameState('playing');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a secret word and a short thematic hint for a game of Hangman. The word should be between 4 and 10 letters. The theme should be 'General Knowledge', 'Science', or 'Technology'. Return as JSON object with 'word' and 'hint' fields.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["word", "hint"]
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      setWord(data.word.toUpperCase());
      setHint(data.hint);
    } catch (err) {
      console.error(err);
      setWord('GEMINI');
      setHint('The AI model powering this app.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || gameState !== 'playing') return;

    setGuessedLetters(prev => [...prev, letter]);
    
    if (!word.includes(letter)) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) setGameState('lost');
        return newLives;
      });
    }
  };

  useEffect(() => {
    if (word && word.split('').every(l => guessedLetters.includes(l))) {
      setGameState('won');
    }
  }, [guessedLetters, word]);

  const renderHangman = () => {
    const errorCount = MAX_LIVES - lives;
    return (
      <svg height="250" width="200" className="stroke-indigo-500 stroke-[4] fill-none drop-shadow-neon">
        <line x1="20" y1="230" x2="180" y2="230" stroke="white" strokeWidth="2" />
        <line x1="100" y1="230" x2="100" y2="20" stroke="white" strokeWidth="2" />
        <line x1="100" y1="20" x2="150" y2="20" stroke="white" strokeWidth="2" />
        <line x1="150" y1="20" x2="150" y2="50" stroke="white" strokeWidth="2" />

        {errorCount > 0 && <circle cx="150" cy="70" r="20" className="stroke-rose-500" />}
        {errorCount > 1 && <line x1="150" y1="90" x2="150" y2="150" className="stroke-rose-500" />}
        {errorCount > 2 && <line x1="150" y1="110" x2="130" y2="130" className="stroke-rose-500" />}
        {errorCount > 3 && <line x1="150" y1="110" x2="170" y2="130" className="stroke-rose-500" />}
        {errorCount > 4 && <line x1="150" y1="150" x2="130" y2="180" className="stroke-rose-500" />}
        {errorCount > 5 && <line x1="150" y1="150" x2="170" y2="180" className="stroke-rose-500" />}
      </svg>
    );
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800">
          <i className="fas fa-chevron-left"></i> Hub
        </button>
        <div className="flex gap-4">
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
             <i className="fas fa-heart text-rose-500"></i>
             <span className="font-orbitron font-bold text-white">{lives}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 items-center pb-8">
        <div className="flex justify-center bg-slate-900/40 p-12 rounded-3xl glass border border-white/5 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Execution Chamber</div>
          {renderHangman()}
        </div>

        <div className="space-y-8 md:space-y-12">
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold">Mystery Word</h2>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {loading ? (
                <div className="h-12 w-full bg-slate-800 animate-pulse rounded-xl"></div>
              ) : (
                word.split('').map((letter, idx) => (
                  <div 
                    key={idx} 
                    className="w-8 md:w-10 h-12 md:h-14 border-b-4 border-slate-700 flex items-center justify-center text-2xl md:text-3xl font-orbitron font-bold text-white"
                  >
                    {guessedLetters.includes(letter) || gameState !== 'playing' ? letter : ''}
                  </div>
                ))
              )}
            </div>
            {!loading && (
              <div className="flex items-start gap-3 p-4 glass rounded-xl border-l-4 border-indigo-500 mt-6 shadow-xl">
                <i className="fas fa-lightbulb text-indigo-400 mt-1"></i>
                <p className="text-slate-400 text-sm leading-relaxed"><span className="font-bold text-indigo-300">Hint:</span> {hint}</p>
              </div>
            )}
          </div>

          {gameState === 'playing' ? (
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={guessedLetters.includes(letter) || loading}
                  className={`h-9 md:h-10 rounded-lg font-bold transition-all border text-xs md:text-sm ${
                    guessedLetters.includes(letter)
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-700 text-white hover:border-indigo-500 hover:scale-105 active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in zoom-in">
              <div className={`text-4xl font-orbitron font-bold ${gameState === 'won' ? 'text-green-400' : 'text-rose-500'}`}>
                {gameState === 'won' ? 'TRIUMPHANT!' : 'TERMINATED.'}
              </div>
              <p className="text-slate-400">
                {gameState === 'won' ? 'You deciphered the code.' : `The word was: ${word}`}
              </p>
              <button 
                onClick={fetchNewWord}
                className="w-full game-gradient py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-[1.02] transition-all"
              >
                NEXT TRANSMISSION
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .drop-shadow-neon {
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
        }
      `}</style>
    </div>
  );
};

export default Hangman;
