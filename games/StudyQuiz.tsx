
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StudyQuizProps {
  onExit: () => void;
}

const StudyQuiz: React.FC<StudyQuizProps> = ({ onExit }) => {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'input' | 'playing' | 'result'>('input');
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const generateQuiz = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 5-question multiple choice quiz based on this text: "${inputText}". 
        Each question must have 4 options and a brief explanation for the correct answer. 
        Return as a JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      setQuestions(data);
      setGameState('playing');
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz. Try a shorter text.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameState('result');
    }
  };

  if (gameState === 'input') {
    return (
      <div className="max-w-3xl mx-auto h-full flex flex-col animate-fade-in">
        <button onClick={onExit} className="self-start text-slate-500 hover:text-white mb-8 transition-colors">
          <i className="fas fa-chevron-left mr-2"></i> Cancel
        </button>
        
        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
              <i className="fas fa-graduation-cap text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-bold">Focus Quiz</h2>
              <p className="text-slate-400 text-sm">Paste your study material to start a challenge.</p>
            </div>
          </div>

          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here (e.g., lecture notes, an article, or a summary)..."
            className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
          />

          <button 
            onClick={generateQuiz}
            disabled={loading || !inputText.trim()}
            className="w-full game-gradient py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner animate-spin"></i> GENERATING CHALLENGE...
              </span>
            ) : "GENERATE QUIZ"}
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentIndex];
    return (
      <div className="max-w-2xl mx-auto h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  i < currentIndex ? 'bg-violet-500' : i === currentIndex ? 'bg-indigo-400 animate-pulse' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-500 font-orbitron text-xs">Question {currentIndex + 1}/{questions.length}</span>
        </div>

        <div className="flex-1 space-y-8">
          <h3 className="text-2xl font-bold leading-relaxed">{q.question}</h3>
          
          <div className="grid gap-4">
            {q.options.map((option, idx) => {
              const isCorrect = idx === q.correctIndex;
              const isSelected = idx === selectedAnswer;
              
              let btnClass = "w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center ";
              if (selectedAnswer === null) {
                btnClass += "bg-slate-800/40 border-slate-700 hover:border-violet-500 hover:bg-slate-800";
              } else if (isCorrect) {
                btnClass += "bg-green-500/20 border-green-500 text-green-400";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-rose-500/20 border-rose-500 text-rose-400";
              } else {
                btnClass += "bg-slate-900/40 border-slate-800 text-slate-600";
              }

              return (
                <button 
                  key={idx} 
                  onClick={() => handleAnswer(idx)}
                  className={btnClass}
                  disabled={selectedAnswer !== null}
                >
                  <span>{option}</span>
                  {selectedAnswer !== null && isCorrect && <i className="fas fa-check-circle"></i>}
                  {selectedAnswer !== null && isSelected && !isCorrect && <i className="fas fa-times-circle"></i>}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="p-6 glass border-l-4 border-indigo-500 rounded-2xl animate-in slide-in-from-bottom-4">
              <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-widest mb-2">Explanation</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
              <button 
                onClick={nextQuestion}
                className="mt-6 w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                {currentIndex === questions.length - 1 ? "SEE RESULTS" : "NEXT QUESTION"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-32 h-32 rounded-full game-gradient flex items-center justify-center text-5xl mb-8 shadow-2xl">
        <i className="fas fa-trophy"></i>
      </div>
      <h2 className="text-4xl font-orbitron font-bold mb-2">Quiz Complete!</h2>
      <p className="text-slate-400 mb-8">You mastered your study notes.</p>
      
      <div className="w-full glass rounded-3xl p-8 mb-8 border-t-4 border-violet-500">
        <div className="text-6xl font-orbitron font-bold text-white mb-2">{score}/{questions.length}</div>
        <div className="text-slate-500 uppercase tracking-widest text-xs">Correct Answers</div>
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={() => {
            setGameState('input');
            setScore(0);
            setCurrentIndex(0);
            setSelectedAnswer(null);
            setShowExplanation(false);
          }}
          className="flex-1 py-4 border border-slate-700 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
        >
          NEW TEXT
        </button>
        <button 
          onClick={onExit}
          className="flex-1 py-4 game-gradient rounded-2xl font-bold shadow-lg"
        >
          FINISH BREAK
        </button>
      </div>
    </div>
  );
};

export default StudyQuiz;
