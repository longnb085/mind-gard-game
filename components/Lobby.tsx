
import React from 'react';
import { GameMode } from '../types';

interface LobbyProps {
  onSelectGame: (mode: GameMode) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onSelectGame }) => {
  const games = [
    {
      id: GameMode.ZEN_SCAPE,
      title: "Zen Scape",
      description: "Create a 2K masterpiece of your happy place. Perfect for a calming 5-minute break.",
      icon: "fa-leaf",
      color: "from-emerald-500 to-teal-400",
      tag: "Relaxation • 5m",
      isNew: true
    },
    {
      id: GameMode.MIND_SPARKS,
      title: "Mind Sparks",
      description: "Rapid-fire logic riddles to sharpen your focus before the next Pomodoro session.",
      icon: "fa-bolt",
      color: "from-amber-500 to-orange-400",
      tag: "Focus • 2m",
      isNew: true
    },
    {
      id: GameMode.VISION_QUEST,
      title: "Vision Quest",
      description: "AI generates surreal images based on hidden words. Solve the visual enigma.",
      icon: "fa-eye",
      color: "from-blue-500 to-cyan-400",
      tag: "Logic • 3m"
    },
    {
      id: GameMode.VOICE_DUNGEON,
      title: "Echo Dungeon",
      description: "A real-time voice RPG. Talk to the dungeon master and shape your destiny.",
      icon: "fa-microphone-alt",
      color: "from-purple-500 to-indigo-400",
      tag: "Long Break • 10m"
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <i className="fas fa-stopwatch"></i> Pomodoro Companion
        </div>
        <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">Recharge Your Mind</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Short, AI-powered experiences designed to refresh your focus during breaks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <div 
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="group relative cursor-pointer h-[320px] overflow-hidden rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            
            <div className="absolute inset-0 p-6 flex flex-col glass group-hover:bg-slate-800/80 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 rounded-md bg-slate-700/50 text-[10px] font-bold tracking-tighter uppercase text-slate-300 border border-white/5">
                  {game.tag}
                </span>
                {game.isNew && (
                  <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
                )}
              </div>

              <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                <i className={`fas ${game.icon} text-2xl text-white`}></i>
              </div>

              <h3 className="text-xl font-orbitron font-bold mb-2">{game.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                {game.description}
              </p>

              <div className="mt-auto flex items-center gap-2 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                PLAY <i className="fas fa-chevron-right text-[10px]"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
