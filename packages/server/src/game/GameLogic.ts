import { 
  GameState, 
} from "@card-game/shared";
import { EnemyManager } from "./enemy/EnemyManager";
import { PlayerManager } from "./player/PlayerManager";
import { AbilityManager } from "./abilities/AbilityManager";
import { initializeGame } from "./GameStateFactory";
import { TurnManager } from "./TurnManager";

export class GameLogic {
  private state: GameState;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private abilityManager: AbilityManager;
  private turnManager: TurnManager;

  constructor(playerDeck?: string[]) {
    this.state = initializeGame(playerDeck);
    this.enemyManager = new EnemyManager(() => this.state);

    this.turnManager = new TurnManager(
      () => this.state,
      this.enemyManager
    );

    this.playerManager = new PlayerManager(
        () => this.state, 
        () => this.turnManager.checkGameOver() 
    );
    
    // TurnManager에 PlayerManager 주입 (순환 참조 해결)
    this.turnManager.setPlayerManager(this.playerManager);

    this.abilityManager = new AbilityManager();
    this.enemyManager.spawnRandomEnemies(this.state);
  }

  public getState(): GameState {
    return this.state;
  }

  public getPlayerManager(): PlayerManager {
    return this.playerManager;
  }

  public getTurnManager(): TurnManager {
    return this.turnManager;
  }

  public getAbilityManager(): AbilityManager {
    return this.abilityManager;
  }
}
