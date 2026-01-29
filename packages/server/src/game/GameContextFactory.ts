import { GameState } from "@card-game/shared";
import { PlayerManager } from "./player/PlayerManager";
import { EnemyManager } from "./enemy/EnemyManager";
import { TurnManager } from "./TurnManager";
import { ShopManager } from "./shop/ShopManager";
import { AbilityManager } from "./abilities/AbilityManager";
import { initializeGame } from "./GameStateFactory";

export interface GameContext {
  state: GameState;
  playerManager: PlayerManager;
  enemyManager: EnemyManager;
  turnManager: TurnManager;
  shopManager: ShopManager;
  abilityManager: AbilityManager;
}

export const createGameContext = (playerDeck: string[]): GameContext => {
  const state = initializeGame(playerDeck);
  const enemyManager = new EnemyManager(() => state);
  const turnManager = new TurnManager(() => state, enemyManager);
  const playerManager = new PlayerManager(() => state);
  const abilityManager = new AbilityManager();
  const shopManager = new ShopManager(() => state);

  // 의존성 주입 및 초기 설정
  turnManager.setPlayerManager(playerManager);
  enemyManager.spawnRandomEnemies(state);

  return {
    state,
    playerManager,
    enemyManager,
    turnManager,
    shopManager,
    abilityManager
  };
};