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

  constructor(playerDeck: string[] | undefined, private broadcast: () => void) {
    this.state = initializeGame(playerDeck);
    this.enemyManager = new EnemyManager(() => this.state);

    this.turnManager = new TurnManager(
      () => this.state,
      this.enemyManager,
      // TurnManager가 직접 상태를 전파할 수 있도록 콜백 전달
      this.broadcast
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

  // --- Facade Methods ---

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
    // TurnManager가 전체 턴 전환 사이클을 담당
    this.turnManager.endTurn();
  }

  public onDisconnect(): void {
    this.turnManager.clearTimers();
  }

  public continueRound(): void {
    this.turnManager.startNextRound();
  }

  public buyCard(cardIndex: number): void {
    this.playerManager.buyCard(cardIndex);
  }
}
