import React, { useState, useEffect, useRef } from 'react';

interface NumberBattleProps {
    onExit: () => void;
}

interface Tile {
    id: string;
    value: number;
    r: number;
    c: number;
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17];

const NumberBattle: React.FC<NumberBattleProps> = ({ onExit }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gridSize, setGridSize] = useState(6);
    const [grid, setGrid] = useState<(Tile | null)[][]>([]);
    const [selected, setSelected] = useState<{ r: number, c: number } | null>(null);
    const [path, setPath] = useState<{ r: number, c: number }[]>([]);
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(0);

    // Remove auto-init on mount since we have a menu now
    // useEffect(() => { initGame(gridSize); }, [gridSize]);

    const startGame = (size: number) => {
        setGridSize(size);
        initGame(size);
        setIsPlaying(true);
    };

    const backToMenu = () => {
        setIsPlaying(false);
    };

    const initGame = (size: number) => {
        const newGrid: (Tile | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

        const numbers: number[] = [];
        const totalTiles = size * size;

        for (let i = 0; i < totalTiles; i++) {
            let val = 1;
            const numFactors = Math.floor(Math.random() * 2) + 1;
            for (let k = 0; k < numFactors; k++) {
                const p = PRIMES[Math.floor(Math.random() * PRIMES.length)];
                val *= p;
            }
            while (val > 100 && val % 2 === 0) val /= 2;
            if (val > 100) val = PRIMES[Math.floor(Math.random() * 4)];

            numbers.push(val);
        }

        let k = 0;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                newGrid[r][c] = {
                    id: `${r}-${c}`,
                    value: numbers[k++],
                    r,
                    c
                };
            }
        }
        setGrid(newGrid);
        setMessage("Clear the board! Match numbers or divide by GCD.");
        setScore(0);
        setSelected(null);
        setPath([]);
    };

    const findPath = (r1: number, c1: number, r2: number, c2: number): { r: number, c: number }[] | null => {
        const queue: any[] = [{ r: r1, c: c1, dir: 0, turns: 0, path: [{ r: r1, c: c1 }] }];
        const visited = new Set<string>();
        visited.add(`${r1}-${c1}-0-0`);

        const dr = [-1, 1, 0, 0];
        const dc = [0, 0, -1, 1];
        const dirs = [1, 2, 3, 4];

        while (queue.length > 0) {
            const { r, c, dir, turns, path } = queue.shift();

            if (r === r2 && c === c2) return path;

            for (let i = 0; i < 4; i++) {
                const nr = r + dr[i];
                const nc = c + dc[i];
                const newDir = dirs[i];

                if (nr < -1 || nr > gridSize || nc < -1 || nc > gridSize) continue;

                const isOutside = (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize);
                const isDest = (nr === r2 && nc === c2);

                if (!isOutside && !isDest && grid[nr][nc] !== null) continue;

                const newTurns = (dir !== 0 && dir !== newDir) ? turns + 1 : turns;

                if (newTurns <= 2) {
                    const stateKey = `${nr}-${nc}-${newDir}`;
                    if (!visited.has(stateKey)) {
                        queue.push({
                            r: nr, c: nc, dir: newDir, turns: newTurns, path: [...path, { r: nr, c: nc }]
                        });
                        visited.add(stateKey);
                    }
                }
            }
        }
        return null;
    };

    const gcd = (a: number, b: number): number => {
        return b === 0 ? a : gcd(b, a % b);
    };

    const handleTileClick = (r: number, c: number) => {
        if (!grid[r] || !grid[r][c]) return;

        if (!selected) {
            setSelected({ r, c });
            setPath([]);
            return;
        }

        if (selected.r === r && selected.c === c) {
            setSelected(null);
            return;
        }

        const start = grid[selected.r][selected.c]!;
        const end = grid[r][c]!;

        const foundPath = findPath(selected.r, selected.c, r, c);

        if (foundPath) {
            let success = false;
            let newVal1 = start.value;
            let newVal2 = end.value;
            const common = gcd(start.value, end.value);

            if (start.value === end.value) {
                newVal1 = 1;
                newVal2 = 1;
                success = true;
                setScore(s => s + 20);
                setMessage(`Matched ${start.value}!`);
            } else if (common > 1) {
                newVal1 = start.value / common;
                newVal2 = end.value / common;
                success = true;
                setScore(s => s + 10);
                setMessage(`GCD(${start.value}, ${end.value}) = ${common}`);
            } else {
                setMessage("Coprime! No common factor.");
            }

            if (success) {
                setPath(foundPath);
                setTimeout(() => {
                    const newGrid = [...grid.map(row => [...row])];
                    if (newVal1 === 1) newGrid[selected.r][selected.c] = null;
                    else newGrid[selected.r][selected.c] = { ...start, value: newVal1 };

                    if (newVal2 === 1) newGrid[r][c] = null;
                    else newGrid[r][c] = { ...end, value: newVal2 };

                    setGrid(newGrid);
                    setPath([]);
                    setSelected(null);

                    if (newGrid.every(row => row.every(cell => cell === null))) {
                        setMessage("VICTORY! All cleared.");
                    }
                }, 400);
            } else {
                setSelected(null);
            }
        } else {
            setMessage("No valid path!");
            setSelected(null);
        }
    };

    if (!isPlaying) {
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center animate-fade-in p-4">
                <button onClick={onExit} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-xl">
                    <i className="fas fa-chevron-left"></i> Hub
                </button>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
                    Number Battle
                </h1>

                <div className="grid gap-4 w-full max-w-sm">
                    <button
                        onClick={() => startGame(4)}
                        className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-500 transition-all text-left"
                    >
                        <h3 className="text-lg font-bold text-white">Easy</h3>
                        <p className="text-slate-400 text-sm">4x4 Grid</p>
                    </button>

                    <button
                        onClick={() => startGame(6)}
                        className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-500 transition-all text-left"
                    >
                        <h3 className="text-lg font-bold text-white">Medium</h3>
                        <p className="text-slate-400 text-sm">6x6 Grid</p>
                    </button>

                    <button
                        onClick={() => startGame(8)}
                        className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-500 transition-all text-left"
                    >
                        <h3 className="text-lg font-bold text-white">Hard</h3>
                        <p className="text-slate-400 text-sm">8x8 Grid</p>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in items-center">
            <div className="w-full flex justify-between items-center mb-6">
                <button onClick={backToMenu} className="text-slate-400 hover:text-white flex items-center gap-2">
                    <i className="fas fa-arrow-left"></i> Menu
                </button>
                <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 font-mono text-emerald-400">
                    Score: {score}
                </div>
            </div>

            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Number Battle</h2>
            <p className="text-slate-400 mb-6 min-h-[1.5em]">{message}</p>

            <div className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-700">
                <div className="relative">
                    <div
                        className="grid gap-2"
                        // ... grid styles ...
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                            width: 'min(90vw, 500px)',
                            height: 'min(90vw, 500px)'
                        }}
                    >
                        {grid.map((row, r) => row.map((tile, c) => (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => handleTileClick(r, c)}
                                className={`
                                    flex items-center justify-center font-bold rounded-lg cursor-pointer select-none transition-all duration-300 ease-out
                                    ${gridSize <= 4 ? 'text-2xl md:text-3xl' : gridSize <= 6 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}
                                    ${!tile ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
                                    ${selected?.r === r && selected?.c === c ? 'bg-cyan-500 text-white scale-110 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-10' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:shadow-md'}
                                    border border-white/5
                                `}
                            >
                                {tile?.value}
                            </div>
                        )))}
                    </div>

                    {/* Path Overlay */}
                    {path.length > 0 && (
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <polyline
                                points={path.map(p => {
                                    const step = 100 / gridSize;
                                    const x = p.c * step + step / 2;
                                    const y = p.r * step + step / 2;
                                    return `${x} ${y}`;
                                }).join(',')}
                                fill="none"
                                stroke="#06b6d4" // Cyan-500
                                strokeWidth={gridSize <= 4 ? "3" : "2.5"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-md"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    )}
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={() => initGame(gridSize)}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-colors"
                >
                    Reset Board
                </button>
            </div>
        </div>
    );
};

export default NumberBattle;
