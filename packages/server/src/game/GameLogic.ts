import { 
  GameState, 
  Entity, 
  UNIT_CARDS,
  GameCard,
} from "@card-game/shared";
import { EnemyManager } from "./enemy/EnemyManager";
import { PlayerManager } from "./player/PlayerManager";
import { v4 as uuidv4 } from 'uuid';

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
    
    let rawDeck: GameCard[] = [];

    
    const deck = this.shuffleDeck(rawDeck);

    // 핸드 드로우 (5장)
    const hand = deck.splice(0, 5);

    return {
      player,
      enemy: { id: "temp_enemy", name: "Loading...", maxHp: 100, currentHp: 100, attackPower: 0, actions: [] } as any,
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

  // 게임 시작 시 덱 초기화 함수
  private initializeDeck(deckCardIds: string[], playerId: string): GameCard[] {
    return deckCardIds.map((cardId) => {
      const originalData = Object.values(UNIT_CARDS).find(c => c.cardId === cardId);
      
      if (!originalData) throw new Error(`Card not found: ${cardId}`);

      // 게임용 인스턴스 생성 (UUID 발급)
      const gameCard: GameCard = {
        ...originalData,        // 기본 스탯 복사
        id: uuidv4(),   // 이 카드만의 고유 번호
        cardId: cardId,     // 원본 데이터 ID
        ownerId: playerId
      };

      return gameCard;
    });
  }

  /**
   * Fisher-Yates 알고리즘을 사용한 배열 셔플 함수
   */
  private shuffleDeck<T>(array: T[]): T[] {
    const shuffled = [...array]; // 원본 보존을 위해 복사
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
