
import React, { useState, useEffect, useRef } from 'react';

interface TypeSprintProps {
    onExit: () => void;
}

interface Word {
    id: number;
    text: string;
    x: number; // percentage 0-90
    y: number; // percentage 0-100
    speed: number;
}

import { WORDS_LIST } from './data/TypeSprintData';

const TypeSprint: React.FC<TypeSprintProps> = ({ onExit }) => {
    const [words, setWords] = useState<Word[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
    const [spawnRate, setSpawnRate] = useState(2000);
    const requestRef = useRef<number>();
    const lastTimeRef = useRef<number>();
    const spawnTimerRef = useRef<number>(0);
    const nextWordId = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const spawnWord = () => {
        const text = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
        const x = Math.random() * 80 + 5; // 5% to 85%
        const speed = 5 + Math.random() * 5 + (score / 100); // Speed increases with score

        setWords(prev => [...prev, {
            id: nextWordId.current++,
            text,
            x,
            y: -10,
            speed
        }]);
    };

    const gameLoop = (time: number) => {
        if (gameState !== 'playing') return;

        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        // Spawn logic
        spawnTimerRef.current += deltaTime * 1000;
        const currentSpawnRate = Math.max(500, 2000 - score * 5); // Cap at 500ms
        if (spawnTimerRef.current > currentSpawnRate) {
            spawnWord();
            spawnTimerRef.current = 0;
        }

        // Move words
        setWords(prevWords => {
            const newWords = prevWords.map(w => ({
                ...w,
                y: w.y + w.speed * deltaTime
            }));

            // Check game over
            if (newWords.some(w => w.y > 100)) {
                setGameState('over');
                return prevWords; // Stop updates
            }

            return newWords;
        });

        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    useEffect(() => {
        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            lastTimeRef.current = undefined; // Reset time
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState]);

    const startGame = () => {
        setWords([]);
        setScore(0);
        setInputValue('');
        setGameState('playing');
        nextWordId.current = 0;
        lastTimeRef.current = undefined;
        spawnTimerRef.current = 0;
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.trim();
        setInputValue(val);

        // Check matches
        const matchIndex = words.findIndex(w => w.text === val);
        if (matchIndex !== -1) {
            // Word cleared
            const newWords = [...words];
            newWords.splice(matchIndex, 1);
            setWords(newWords);
            setScore(prev => prev + 10);
            setInputValue(''); // Clear input

            // visual feedback?
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 z-10">
                <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800">
                    <i className="fas fa-chevron-left"></i> Hub
                </button>
                <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 shadow-lg">
                    <i className="fas fa-keyboard text-emerald-400 mr-2"></i>
                    <span className="font-orbitron font-bold text-white">{score}</span>
                </div>
            </div>

            <div className="flex-1 relative bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner overflow-hidden" ref={containerRef}>
                {gameState === 'idle' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                        <h1 className="text-4xl font-orbitron font-bold text-emerald-400 mb-4">Speed Typing</h1>
                        <p className="text-slate-300 mb-8 max-w-sm text-center">
                            Type the falling words before they hit the bottom.
                            Boost your focus and reaction speed.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-colors"
                        >
                            Start Game
                        </button>
                    </div>
                ) : gameState === 'over' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-20 animate-in zoom-in">
                        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">GAME OVER</h2>
                        <p className="text-emerald-400 mb-8 font-bold text-xl">Score: {score}</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : null}

                {/* Words Layer */}
                {words.map(word => (
                    <div
                        key={word.id}
                        className="absolute px-3 py-1 bg-slate-800/80 border border-emerald-500/30 text-emerald-300 font-mono text-sm rounded-md shadow-lg"
                        style={{
                            left: `${word.x}%`,
                            top: `${word.y}%`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        {word.text}
                    </div>
                ))}

                {/* Danger Line */}
                <div className="absolute bottom-0 w-full h-1 bg-rose-500/50 animate-pulse"></div>
            </div>

            {/* Input Area */}
            <div className="mt-4 z-10 w-full max-w-md mx-auto">
                <div className="relative">
                    <i className="fas fa-keyboard absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInput}
                        disabled={gameState !== 'playing'}
                        autoFocus
                        className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-white font-mono outline-none transition-colors"
                        placeholder={gameState === 'playing' ? "Type here..." : "Ready..."}
                    />
                </div>
            </div>
        </div>
    );
};

export default TypeSprint;
