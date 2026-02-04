
import React, { useState, useEffect, useCallback } from 'react';

interface StroopChallengeProps {
    onExit: () => void;
}

const COLORS = [
    { name: 'RED', hex: '#ef4444' },     // red-500
    { name: 'BLUE', hex: '#3b82f6' },    // blue-500
    { name: 'GREEN', hex: '#22c55e' },   // green-500
    { name: 'YELLOW', hex: '#eab308' },  // yellow-500
    { name: 'PURPLE', hex: '#a855f7' },  // purple-500
];

const StroopChallenge: React.FC<StroopChallengeProps> = ({ onExit }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
    const [currentWord, setCurrentWord] = useState({ text: '', colorHex: '' });

    // Feedback animation
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

    const generateRound = useCallback(() => {
        const textIndex = Math.floor(Math.random() * COLORS.length);
        let colorIndex = Math.floor(Math.random() * COLORS.length);

        // Ensure 50% chance of mismatch vs match, actually for Stroop it's usually mismatched
        // Let's just random is fine, but maybe bias towards mismatch for difficulty?
        // Mismatch creates the Stroop effect.
        while (Math.random() > 0.3 && colorIndex === textIndex) {
            colorIndex = Math.floor(Math.random() * COLORS.length);
        }

        setCurrentWord({
            text: COLORS[textIndex].name,
            colorHex: COLORS[colorIndex].hex
        });
    }, []);

    const startGame = () => {
        setScore(0);
        setTimeLeft(60);
        setGameState('playing');
        generateRound();
    };

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('ended');
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const handleChoice = (selectedColorHex: string) => {
        if (gameState !== 'playing') return;

        if (selectedColorHex === currentWord.colorHex) {
            setScore(prev => prev + 100);
            setFeedback('correct');
            setTimeout(() => setFeedback('none'), 200);
            generateRound();
        } else {
            setScore(prev => Math.max(0, prev - 50));
            setFeedback('wrong');
            setTimeout(() => setFeedback('none'), 200);
            // Optional: shake effect or time penalty?
            // Let's just continue
            generateRound();
        }
    };

    return (
        <div className={`max-w-4xl mx-auto h-full flex flex-col animate-fade-in transition-colors duration-200 ${feedback === 'correct' ? 'bg-green-500/10' : feedback === 'wrong' ? 'bg-red-500/10' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800">
                    <i className="fas fa-chevron-left"></i> Hub
                </button>
                <div className="flex gap-4">
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
                        <span className="font-orbitron font-bold text-yellow-400">{score}</span>
                        <span className="text-slate-500 text-xs">PTS</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
                        <i className="fas fa-clock text-rose-400"></i>
                        <span className="font-orbitron font-bold text-white">{timeLeft}s</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {gameState === 'idle' ? (
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <i className="fas fa-brain text-4xl text-white"></i>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white">
                            Stroop Challenge
                        </h1>
                        <p className="text-slate-400">
                            Select the <span className="text-white font-bold">INK COLOR</span> of the word, not what the word says.
                            Trains attention control and cognitive flexibility.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
                        >
                            Start Challenge
                        </button>
                    </div>
                ) : gameState === 'ended' ? (
                    <div className="text-center space-y-6 animate-in zoom-in">
                        <h2 className="text-3xl font-orbitron font-bold text-white">Time's Up!</h2>
                        <div className="text-6xl font-orbitron font-bold text-yellow-400 drop-shadow-lg">
                            {score}
                        </div>
                        <p className="text-slate-500 uppercase tracking-widest font-bold">Final Score</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white hover:bg-slate-750 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-lg flex flex-col items-center gap-12">
                        <div className="flex-1 flex items-center justify-center w-full min-h-[200px] glass rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                            {/* Word Display */}
                            <h1
                                className="text-6xl md:text-8xl font-black tracking-tighter transition-all transform scale-100 hover:scale-105 select-none"
                                style={{ color: currentWord.colorHex, textShadow: '0 0 30px rgba(0,0,0,0.5)' }}
                            >
                                {currentWord.text}
                            </h1>
                            <div className="absolute top-4 right-4 text-xs text-slate-600 font-bold uppercase tracking-widest">
                                Pick the ink color
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-5 gap-2 w-full">
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => handleChoice(color.hex)}
                                    className="h-16 rounded-xl border-2 border-transparent hover:border-white/50 transition-all hover:scale-105 active:scale-95 shadow-lg"
                                    style={{ backgroundColor: color.hex }}
                                    aria-label={color.name}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StroopChallenge;
