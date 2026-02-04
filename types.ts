
export enum GameMode {
  LOBBY = 'LOBBY',

  MIND_SPARKS = 'MIND_SPARKS',
  STUDY_QUIZ = 'STUDY_QUIZ',
  HANGMAN = 'HANGMAN',
  MINESWEEPER = 'MINESWEEPER',
  SCHULTE_TABLE = 'SCHULTE_TABLE',
  STROOP_CHALLENGE = 'STROOP_CHALLENGE',

  MEMORY_MATRIX = 'MEMORY_MATRIX',
  TYPE_SPRINT = 'TYPE_SPRINT'
}

export interface GameState {
  score: number;
  level: number;
  history: any[];
}
