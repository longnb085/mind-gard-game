
import React from 'react';
import { GameMode } from '../types';

interface LobbyProps {
  onSelectGame: (mode: GameMode) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onSelectGame }) => {
  const games = [
    {
      id: GameMode.MINESWEEPER,
      title: "Neon Sweeper",
      description: "A cyberpunk take on the classic. Clear the grid of hidden data-mines. Fast-paced logic fun.",
      icon: "fa-bomb",
      color: "from-cyan-500 to-blue-400",
      tag: "Logic • 2m",
      isNew: false
    },
    {
      id: GameMode.SCHULTE_TABLE,
      title: "Schulte Grid",
      description: "Find numbers in order. High-intensity vision training.",
      icon: "fa-border-all",
      color: "from-cyan-500 to-blue-400",
      tag: "Focus • 1m",
      isNew: true
    },
    {
      id: GameMode.STROOP_CHALLENGE,
      title: "Stroop Test",
      description: "Don't read the word, name the color. Cognitive flexibility.",
      icon: "fa-palette",
      color: "from-pink-500 to-rose-400",
      tag: "Brain • 2m",
      isNew: true
    },

    {
      id: GameMode.MEMORY_MATRIX,
      title: "Memory Matrix",
      description: "Recall patterns on a grid. Working memory booster.",
      icon: "fa-th",
      color: "from-violet-500 to-purple-400",
      tag: "Memory • 3m",
      isNew: true
    },
    {
      id: GameMode.TYPE_SPRINT,
      title: "Type Sprint",
      description: "Type falling code keywords. Wake up your fingers.",
      icon: "fa-keyboard",
      color: "from-emerald-500 to-teal-400",
      tag: "Speed • 2m",
      isNew: true
    },
    {
      id: GameMode.HANGMAN,
      title: "Lexi Hangman",
      description: "Guess secret words from AI-generated thematic hints. Infinite vocabulary training.",
      icon: "fa-font",
      color: "from-rose-500 to-pink-400",
      tag: "Word • 3m"
    },
    {
      id: GameMode.STUDY_QUIZ,
      title: "Focus Quiz",
      description: "Convert your study notes into a quick 5-question challenge. Best for reinforcing memory.",
      icon: "fa-graduation-cap",
      color: "from-violet-500 to-purple-400",
      tag: "Learning • 4m"
    },

    {
      id: GameMode.MIND_SPARKS,
      title: "Mind Sparks",
      description: "Rapid-fire logic riddles to sharpen your focus before the next Pomodoro session.",
      icon: "fa-bolt",
      color: "from-amber-500 to-orange-400",
      tag: "Focus • 2m"
    },

  ];

  return (
    <div className="animate-fade-in pb-12">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <i className="fas fa-stopwatch"></i> Pomodoro Companion
        </div>
        <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-4">Recharge Your Mind</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base px-4">
          Short, AI-enhanced experiences designed to refresh your cognitive focus during break cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="group relative cursor-pointer h-[280px] md:h-[320px] overflow-hidden rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10"
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
                START BREAK <i className="fas fa-chevron-right text-[10px]"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
