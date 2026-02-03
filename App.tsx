
import React, { useState } from 'react';
import { GameMode } from './types';
import Lobby from './components/Lobby';
import VisionQuest from './games/VisionQuest';
import VoiceDungeon from './games/VoiceDungeon';
import ChronoRPG from './games/ChronoRPG';
import ZenScape from './games/ZenScape';
import MindSparks from './games/MindSparks';
import StudyQuiz from './games/StudyQuiz';
import Hangman from './games/Hangman';
import Minesweeper from './games/Minesweeper';


const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.LOBBY);

  const renderContent = () => {
    switch (currentMode) {
      case GameMode.HANGMAN:
        return <Hangman onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.MINESWEEPER:
        return <Minesweeper onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.VISION_QUEST:
        return <VisionQuest onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.VOICE_DUNGEON:
        return <VoiceDungeon onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.CHRONO_RPG:
        return <ChronoRPG onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.ZEN_SCAPE:
        return <ZenScape onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.MIND_SPARKS:
        return <MindSparks onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      case GameMode.STUDY_QUIZ:
        return <StudyQuiz onExit={() => setCurrentMode(GameMode.LOBBY)} />;
      default:
        return <Lobby onSelectGame={(mode) => setCurrentMode(mode)} />;
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#0a0f1d] overflow-hidden">
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
            BREAK HUB
          </h1>
        </div>
        
        <div className="flex gap-4 md:gap-6 items-center">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pomodoro Status</span>
             <span className="text-sm text-pink-500 font-medium">Break in Progress</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AI Online
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
    </div>
  );
};

export default App;
