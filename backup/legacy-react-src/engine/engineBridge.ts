import type { Game } from './Game';

let activeGame: Game | null = null;

export const engineBridge = {
  setGame(game: Game | null): void {
    activeGame = game;
  },
  getGame(): Game | null {
    return activeGame;
  },
};

