
import React, { useState, useEffect, useRef } from 'react';
import { chatWithRPG } from '../services/geminiService';

interface ChronoRPGProps {
  onExit: () => void;
}

const ChronoRPG: React.FC<ChronoRPGProps> = ({ onExit }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      handleUserAction("Start a new game at the Library of Alexandria, 48 BC.");
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserAction = async (action: string) => {
    if (loading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: action }]);
    setLoading(true);

    try {
      const response = await chatWithRPG(messages, action);
      if (response) {
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "The timeline is fractured... I cannot see what happens next. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col glass rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-fade-in">
      {/* RPG Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
            <i className="fas fa-scroll"></i>
          </div>
          <div>
            <h3 className="font-orbitron font-bold">Chrono Lore</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Temporal Node Active</p>
          </div>
        </div>
        <button onClick={onExit} className="p-2 text-slate-500 hover:text-white transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Narrative View */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
            <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-6 py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input / Choices */}
      <div className="p-8 border-t border-slate-700 bg-slate-900/50">
        {!loading && messages.length > 0 && messages[messages.length-1].role === 'ai' && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleUserAction("Wait, what happens if I run?")}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sm transition-colors"
            >
              "I'll take my chances and run!"
            </button>
            <button 
              onClick={() => handleUserAction("I want to explore my surroundings more.")}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sm transition-colors"
            >
              "I carefully examine the area."
            </button>
          </div>
        )}
        
        <div className="mt-6 flex gap-4">
          <input 
            type="text"
            placeholder="Describe your next move..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                handleUserAction(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-6 py-3 focus:outline-none focus:border-indigo-500"
          />
          <button className="w-12 h-12 rounded-xl game-gradient flex items-center justify-center shadow-lg">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChronoRPG;
