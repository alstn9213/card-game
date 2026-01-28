import { 
  GameState, 
} from "@card-game/shared";
import { EnemyManager } from "./enemy/EnemyManager";
import { PlayerManager } from "./player/PlayerManager";
import { AbilityManager } from "./abilities/AbilityManager";
import { ShopManager } from "./shop/ShopManager";
import { initializeGame } from "./GameStateFactory";
import { TurnManager } from "./TurnManager";

export class GameLogic {
  private state: GameState;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private abilityManager: AbilityManager;
  private shopManager: ShopManager;
  private turnManager: TurnManager;

  constructor(playerDeck: string[] | undefined) {
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
    this.shopManager = new ShopManager(() => this.state);
    this.enemyManager.spawnRandomEnemies(this.state);
  }

  // --- getter ---

  public getState(): GameState {
    return this.state;
  }

  // --- Facade Methods ---

  public onDisconnect(): void {}

  public playCard(cardIndex: number): void {
    this.playerManager.playCard(cardIndex);
  }

  public attack(attackerId: string, targetId: string): void {
    this.playerManager.attack(attackerId, targetId);
  }

  public activateAbility(cardInstanceId: string, abilityIndex: number, targetId?: string): void {
    this.abilityManager.executeAbility(this.state, this.state.player.id, cardInstanceId, abilityIndex, targetId);
  }

  public endTurn(): void {
    this.turnManager.endTurn();
  }


  public processEnemyTurn(): void {
    this.turnManager.processEnemyTurn();
  }

  public startPlayerTurn(): void {
    this.turnManager.startPlayerTurn();
  }

  public continueRound(): void {
    this.turnManager.startNextRound();
  }

  public buyCard(cardIndex: number): void {
    this.shopManager.buyCard(cardIndex);
  }
}
