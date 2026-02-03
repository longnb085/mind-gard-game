
import React, { useState, useEffect, useCallback } from 'react';

interface MinesweeperProps {
  onExit: () => void;
}

interface Cell {
  row: number;
  col: number;
  isBomb: boolean;
  neighborCount: number;
  revealed: boolean;
  flagged: boolean;
}

const GRID_SIZE = 10;
const BOMB_COUNT = 15;

const Minesweeper: React.FC<MinesweeperProps> = ({ onExit }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [flagsUsed, setFlagsUsed] = useState(0);

  const initGrid = useCallback(() => {
    // Create empty grid
    const newGrid: Cell[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        newGrid[r][c] = {
          row: r,
          col: c,
          isBomb: false,
          neighborCount: 0,
          revealed: false,
          flagged: false,
        };
      }
    }

    // Place bombs
    let bombsPlaced = 0;
    while (bombsPlaced < BOMB_COUNT) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[r][c].isBomb) {
        newGrid[r][c].isBomb = true;
        bombsPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c].isBomb) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                if (newGrid[nr][nc].isBomb) count++;
              }
            }
          }
          newGrid[r][c].neighborCount = count;
        }
      }
    }

    setGrid(newGrid);
    setGameState('playing');
    setFlagsUsed(0);
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const revealCell = (r: number, c: number) => {
    if (gameState !== 'playing' || grid[r][c].revealed || grid[r][c].flagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[r][c].isBomb) {
      // Game Over
      newGrid[r][c].revealed = true;
      // Reveal all bombs
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isBomb) cell.revealed = true;
      }));
      setGrid(newGrid);
      setGameState('lost');
      return;
    }

    // Flood fill logic
    const stack: [number, number][] = [[r, c]];
    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      if (newGrid[currR][currC].revealed) continue;
      
      newGrid[currR][currC].revealed = true;

      if (newGrid[currR][currC].neighborCount === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !newGrid[nr][nc].revealed) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }

    setGrid(newGrid);

    // Check Win
    const allSafeRevealed = newGrid.every(row => 
      row.every(cell => cell.isBomb || cell.revealed)
    );
    if (allSafeRevealed) setGameState('won');
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || grid[r][c].revealed) return;

    const newGrid = [...grid.map(row => [...row])];
    const newFlaggedState = !newGrid[r][c].flagged;
    
    if (newFlaggedState && flagsUsed >= BOMB_COUNT) return;

    newGrid[r][c].flagged = newFlaggedState;
    setFlagsUsed(prev => newFlaggedState ? prev + 1 : prev - 1);
    setGrid(newGrid);
  };

  const getNumberColor = (count: number) => {
    switch (count) {
      case 1: return 'text-blue-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-rose-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-amber-400';
      default: return 'text-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in pb-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800">
          <i className="fas fa-chevron-left"></i> Hub
        </button>
        <div className="flex gap-4">
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-4 shadow-lg">
             <div className="flex items-center gap-2">
                <i className="fas fa-bomb text-rose-500"></i>
                <span className="font-orbitron font-bold text-white">{BOMB_COUNT - flagsUsed}</span>
             </div>
             <div className="w-px h-4 bg-slate-600"></div>
             <button onClick={initGrid} className="text-indigo-400 hover:text-white transition-colors">
                <i className="fas fa-redo"></i>
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="p-4 md:p-6 bg-slate-900/60 rounded-3xl glass border border-white/5 shadow-2xl overflow-auto max-w-full">
            <div 
              className="grid gap-1 md:gap-2" 
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
                {grid.map((row, rIdx) => 
                  row.map((cell, cIdx) => (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => revealCell(rIdx, cIdx)}
                      onContextMenu={(e) => toggleFlag(e, rIdx, cIdx)}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-lg md:text-xl font-bold transition-all
                        ${cell.revealed 
                          ? 'bg-slate-800/50 border border-slate-700 cursor-default' 
                          : 'bg-slate-800 border-b-4 border-slate-950 hover:bg-slate-700 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0 cursor-pointer shadow-md'
                        }
                        ${cell.flagged && !cell.revealed ? 'text-rose-500' : ''}
                      `}
                    >
                      {cell.revealed ? (
                        cell.isBomb ? (
                          <i className="fas fa-bomb text-rose-500 animate-pulse"></i>
                        ) : cell.neighborCount > 0 ? (
                          <span className={getNumberColor(cell.neighborCount)}>{cell.neighborCount}</span>
                        ) : null
                      ) : cell.flagged ? (
                        <i className="fas fa-flag text-rose-500 text-sm md:text-base"></i>
                      ) : null}
                    </button>
                  ))
                )}
            </div>
        </div>

        {gameState !== 'playing' && (
          <div className="mt-8 text-center animate-in zoom-in space-y-4">
             <div className={`text-4xl font-orbitron font-bold ${gameState === 'won' ? 'text-green-400' : 'text-rose-500'}`}>
                {gameState === 'won' ? 'SYSTEM SECURE' : 'SYSTEM BREACHED'}
             </div>
             <p className="text-slate-400">
                {gameState === 'won' ? 'All mines successfully identified.' : 'You hit a critical sector mine.'}
             </p>
             <button 
                onClick={initGrid}
                className="game-gradient px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-all"
             >
                REBOOT SESSION
             </button>
          </div>
        )}

        <div className="mt-8 text-slate-500 text-xs flex gap-6 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 rounded"></div> Left Click: Reveal</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 rounded flex items-center justify-center text-rose-500 text-[8px]"><i className="fas fa-flag"></i></div> Right Click: Flag</div>
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;
