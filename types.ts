
export enum GameMode {
  LOBBY = 'LOBBY',
  VISION_QUEST = 'VISION_QUEST',
  VOICE_DUNGEON = 'VOICE_DUNGEON',
  CHRONO_RPG = 'CHRONO_RPG',
  ZEN_SCAPE = 'ZEN_SCAPE',
  MIND_SPARKS = 'MIND_SPARKS',
  STUDY_QUIZ = 'STUDY_QUIZ',
  HANGMAN = 'HANGMAN',
  MINESWEEPER = 'MINESWEEPER'
}

export interface GameState {
  score: number;
  level: number;
  history: any[];
}
