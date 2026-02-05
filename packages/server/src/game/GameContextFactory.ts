import { GameState } from "@card-game/shared";
import { PlayerManager } from "./player/PlayerManager";
import { EnemyManager } from "./enemy/EnemyManager";
import { TurnManager } from "./TurnManager";
import { ShopManager } from "./shop/ShopManager";
import { initializeGame } from "./GameStateFactory";

export interface GameContext {
  state: GameState;
  playerManager: PlayerManager;
  enemyManager: EnemyManager;
  turnManager: TurnManager;
  shopManager: ShopManager;
}

export const createGameContext = (playerDeck: string[]): GameContext => {
  const state = initializeGame(playerDeck);
  const enemyManager = new EnemyManager(() => state);
  const turnManager = new TurnManager(() => state);
  const playerManager = new PlayerManager(() => state);
  const shopManager = new ShopManager(() => state);

  return {
    state,
    playerManager,
    enemyManager,
    turnManager,
    shopManager,
  };
};