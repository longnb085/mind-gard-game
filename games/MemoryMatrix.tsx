
import React, { useState, useEffect, useCallback } from 'react';

interface MemoryMatrixProps {
    onExit: () => void;
}

const MemoryMatrix: React.FC<MemoryMatrixProps> = ({ onExit }) => {
    const [gridSize, setGridSize] = useState(3);
    const [pattern, setPattern] = useState<number[]>([]);
    const [userPattern, setUserPattern] = useState<number[]>([]);
    const [gameState, setGameState] = useState<'showing' | 'playing' | 'won' | 'lost' | 'idle'>('idle');
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(3);

    const generatePattern = useCallback((size: number, level: number) => {
        // Determine how many tiles to light up based on level
        const tileCount = Math.min(Math.floor(size * size * 0.4) + Math.floor(level / 2), size * size - 1);
        const newPattern: number[] = [];

        while (newPattern.length < tileCount) {
            const tile = Math.floor(Math.random() * (size * size));
            if (!newPattern.includes(tile)) {
                newPattern.push(tile);
            }
        }
        return newPattern;
    }, []);

    const startLevel = () => {
        setUserPattern([]);
        setGameState('showing');
        const newPattern = generatePattern(gridSize, level);
        setPattern(newPattern);

        setTimeout(() => {
            setGameState('playing');
        }, 1500 + level * 100); // Show time slightly increases or stays fixed? Actually fixed is harder. Let's do fixed ~2s
    };

    const startGame = () => {
        setLevel(1);
        setLives(3);
        setGridSize(3);
        setGameState('idle');
        // Use timeout to allow state reset before starting
        setTimeout(startLevel, 100);
    };

    const handleTileClick = (index: number) => {
        if (gameState !== 'playing') return;

        if (pattern.includes(index)) {
            if (!userPattern.includes(index)) {
                const newUserPattern = [...userPattern, index];
                setUserPattern(newUserPattern);

                if (newUserPattern.length === pattern.length) {
                    // Level complete
                    setGameState('won'); // Temporary state for animation
                    setTimeout(() => {
                        setLevel(prev => prev + 1);
                        if ((level + 1) % 3 === 0) setGridSize(prev => Math.min(prev + 1, 6)); // Increase grid size every 3 levels
                        startLevel();
                    }, 1000);
                }
            }
        } else {
            // Wrong tile
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives === 0) {
                setGameState('lost');
            } else {
                // Flash red or something?
                // Just restart level
                // Show pattern again? Yes.
                setUserPattern([]);
                setGameState('showing');
                setTimeout(() => {
                    setGameState('playing');
                }, 1500);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800">
                    <i className="fas fa-chevron-left"></i> Hub
                </button>
                <div className="flex gap-4">
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
                        <i className="fas fa-layer-group text-purple-400"></i>
                        <span className="font-orbitron font-bold text-white">LVL {level}</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
                        <i className="fas fa-heart text-rose-500"></i>
                        <span className="font-orbitron font-bold text-white">{lives}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {gameState === 'idle' && lives === 3 && level === 1 ? (
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                            <i className="fas fa-th text-4xl text-white"></i>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white">Memory Matrix</h1>
                        <p className="text-slate-400">
                            Memorize the pattern of highlighted tiles. Recreate it after they vanish.
                            Updates working memory capacity.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
                        >
                            Start Training
                        </button>
                    </div>
                ) : gameState === 'lost' ? (
                    <div className="text-center space-y-6 animate-in zoom-in">
                        <h2 className="text-3xl font-orbitron font-bold text-rose-500">System Overload</h2>
                        <div className="text-5xl font-bold text-white">Level obtained: {level}</div>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white hover:bg-slate-750 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div
                        className="grid gap-2 bg-slate-900/50 p-4 rounded-2xl border border-white/5 shadow-2xl transition-all"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            width: '100%',
                            maxWidth: '500px',
                            aspectRatio: '1/1'
                        }}
                    >
                        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                            const isPattern = pattern.includes(idx);
                            const isSelected = userPattern.includes(idx);
                            const isShowing = gameState === 'showing';

                            let bgClass = "bg-slate-800 border-slate-700";
                            if (isShowing && isPattern) {
                                bgClass = "bg-violet-500 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-105";
                            } else if (isSelected) {
                                bgClass = "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleTileClick(idx)}
                                    className={`
                                rounded-lg md:rounded-xl border transition-all duration-300
                                ${bgClass}
                                ${gameState === 'playing' ? 'hover:bg-slate-700' : ''}
                            `}
                                />
                            );
                        })}
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="mt-8 text-slate-500 text-sm font-bold uppercase tracking-widest animate-pulse">
                        Recall Pattern
                    </div>
                )}
                {gameState === 'showing' && (
                    <div className="mt-8 text-violet-400 text-sm font-bold uppercase tracking-widest">
                        Memorize...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemoryMatrix;
