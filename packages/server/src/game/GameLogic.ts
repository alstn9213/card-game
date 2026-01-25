import { 
  GameState, 
  Entity, 
  UNIT_CARDS, 
} from "@card-game/shared";
import { EnemyManager } from "./enemy/EnemyManager";
import { PlayerManager } from "./player/PlayerManager";

export class GameLogic {
  private state: GameState;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;

  constructor() {
    this.state = this.initializeGame();
    this.enemyManager = new EnemyManager(() => this.state);
    this.playerManager = new PlayerManager(
        () => this.state, 
        () => this.checkGameOver()
    );
    this.state.enemy = this.enemyManager.spawnNewEnemy(this.state);
  }

  public getState(): GameState {
    return this.state;
  }

  private initializeGame(): GameState {
    const player: Entity = { id: "player", name: "Hero", maxHp: 4000, currentHp: 4000 };
    
   
    const deck = [...UNIT_CARDS];
    const hand = deck.splice(0, 5);

    return {
      player,
      enemy: this.state.enemy,
      hand,
      deck,
      playerField: Array(5).fill(null), // 5칸의 빈 필드로 초기화
      enemyField: Array(5).fill(null),
      discardPile: [],
      currentGold: 5,
      turn: 1,
      isPlayerTurn: true,
      gameStatus: "playing",
    };
  }

  
  public playCard(cardIndex: number) {
    return this.playerManager.playCard(cardIndex);
  }

  public attack(attackerId: string, targetId: string) {
    return this.playerManager.attack(attackerId, targetId);
  }

  public endTurn() {
    if (!this.state.isPlayerTurn) return;
    this.state.isPlayerTurn = false;
  }

  public processEnemyTurn() {
    if (this.state.gameStatus !== "playing") return;
    this.enemyManager.executeTurn();    
    this.startPlayerTurn();
  }

  private startPlayerTurn() {
    this.state.turn++;
    this.state.isPlayerTurn = true;

    // 플레이어 유닛들의 공격권 초기화
    this.playerManager.onTurnStart();

    this.checkGameOver();
  }

  private checkGameOver() {
    if (this.state.player.currentHp <= 0) {
      this.state.gameStatus = "defeat";
    } else if (this.state.enemy.currentHp <= 0) {
      if (this.state.enemy.cost) {
        this.state.currentGold += this.state.enemy.cost;
      }
      this.startNextRound();
    }
  }

  private startNextRound() {
    this.state.enemy = this.enemyManager.spawnNewEnemy(this.state);
  }
}
