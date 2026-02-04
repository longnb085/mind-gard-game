
import React, { useState, useEffect } from 'react';

interface SchulteTableProps {
    onExit: () => void;
}

const SchulteTable: React.FC<SchulteTableProps> = ({ onExit }) => {
    const [grid, setGrid] = useState<number[]>([]);
    const [currentNumber, setCurrentNumber] = useState(1);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
    const size = 5;

    const initializeGame = () => {
        const numbers = Array.from({ length: size * size }, (_, i) => i + 1);
        // Fisher-Yates shuffle
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        setGrid(numbers);
        setCurrentNumber(1);
        setGameState('playing');
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (gameState === 'playing' && startTime) {
            interval = setInterval(() => {
                setTimeElapsed((Date.now() - startTime) / 1000);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gameState, startTime]);

    const handleNumberClick = (num: number) => {
        if (gameState !== 'playing') return;

        if (num === currentNumber) {
            if (currentNumber === size * size) {
                setGameState('won');
            } else {
                setCurrentNumber(prev => prev + 1);
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
                        <i className="fas fa-stopwatch text-cyan-400"></i>
                        <span className="font-orbitron font-bold text-white min-w-[60px] text-right">
                            {timeElapsed.toFixed(1)}s
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {gameState === 'idle' ? (
                    <div className="text-center space-y-6 max-w-md">
                        <h1 className="text-4xl md:text-5xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            Schulte Table
                        </h1>
                        <p className="text-slate-400">
                            Find numbers 1 to 25 in ascending order as fast as possible.
                            Improves peripheral vision and reading speed.
                        </p>
                        <button
                            onClick={initializeGame}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
                        >
                            Start Focus Session
                        </button>
                    </div>
                ) : gameState === 'won' ? (
                    <div className="text-center space-y-6 animate-in zoom-in">
                        <div className="text-6xl text-green-400 mb-4">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2 className="text-3xl font-orbitron font-bold text-white">Focus Complete</h2>
                        <p className="text-2xl text-cyan-400 font-bold">{timeElapsed.toFixed(2)}s</p>
                        <button
                            onClick={initializeGame}
                            className="px-8 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white hover:bg-slate-750 transition-colors"
                        >
                            Play Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-2 md:gap-3 p-4 bg-slate-900/50 rounded-2xl border border-white/5 shadow-2xl">
                        {grid.map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num)}
                                className={`
                  w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl text-xl md:text-2xl font-bold font-orbitron transition-all active:scale-95
                  ${num < currentNumber
                                        ? 'bg-slate-800/30 text-slate-600 border border-slate-800'
                                        : 'bg-slate-800 border-slate-700 text-white hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                    }
                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="mt-8 text-slate-500 text-sm font-bold uppercase tracking-widest">
                        Find: <span className="text-cyan-400 text-lg ml-2">{currentNumber}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchulteTable;
