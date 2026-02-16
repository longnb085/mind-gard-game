
import React, { useState } from 'react';
import { GameMode } from './types';
import Lobby from './components/Lobby';

import MindSparks from './games/MindSparks';
import StudyQuiz from './games/StudyQuiz';
import Hangman from './games/Hangman';
import Minesweeper from './games/Minesweeper';
import SchulteTable from './games/SchulteTable';
import StroopChallenge from './games/StroopChallenge';

import MemoryMatrix from './games/MemoryMatrix';
import TypeSprint from './games/TypeSprint';
import FactorLink from './games/FactorLink';


const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.LOBBY);
  const [sessionTime, setSessionTime] = useState(300); // 5 minutes global break limit
  const [isSessionOver, setIsSessionOver] = useState(false);

  // Global Timer Effect
  React.useEffect(() => {
    if (sessionTime <= 0) {
      setIsSessionOver(true);
      return;
    }

    const timer = setInterval(() => {
      setSessionTime(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extendBreak = () => {
    setSessionTime(60); // Add 1 minute
    setIsSessionOver(false);
  };

  const renderContent = () => {
    switch (currentMode) {
      case GameMode.HANGMAN:
        return <Hangman onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.MINESWEEPER:
        return <Minesweeper onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.SCHULTE_TABLE:
        return <SchulteTable onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.STROOP_CHALLENGE:
        return <StroopChallenge onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.MEMORY_MATRIX:
        return <MemoryMatrix onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.TYPE_SPRINT:
        return <TypeSprint onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.NUMBER_BATTLE:
        return <FactorLink onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.MIND_SPARKS:
        return <MindSparks onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.STUDY_QUIZ:
        return <StudyQuiz onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      default:
        return <Lobby onSelectGame={(mode) => setCurrentMode(mode)} />;
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#0a0f1d] overflow-hidden relative">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center glass sticky top-0 z-50">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentMode(GameMode.LOBBY)}
        >
          <div className="w-10 h-10 game-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <i className="fas fa-brain text-white"></i>
          </div>
          <h1 className="text-xl md:text-2xl font-orbitron font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
            MINDGARD
          </h1>
        </div>

        <div className="flex gap-4 md:gap-6 items-center">
          <a
            href="https://github.com/NguyenKiem204/MindGardExtension"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 text-xs font-bold uppercase tracking-wide transition-all hover:scale-105"
          >
            <i className="fas fa-puzzle-piece"></i>
            <span>MindGard Extension</span>
          </a>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Break Time Remaining</span>
            <div className={`text-xl font-mono font-bold flex items-center gap-2 ${sessionTime < 60 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
              <i className="fas fa-stopwatch text-sm"></i>
              {formatTime(sessionTime)}
            </div>
          </div>
        </div>
      </header>

      {/* Main View */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] shrink-0">
        Designed for Focus • Powered by Gemini 3.0
      </footer>

      {/* Global Session Timeout Modal */}
      {isSessionOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="text-center max-w-md w-full mx-4 p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="text-6xl mb-6">☕</div>
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Break Complete</h2>
            <p className="text-slate-400 mb-8">Time to get back to work! Your brain is refreshed.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.close()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                Return to Work
              </button>
              <button
                onClick={extendBreak}
                className="w-full py-3 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition-colors text-sm"
              >
                Need 1 more minute?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
