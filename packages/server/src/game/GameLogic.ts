import { validateDeck } from '@card-game/shared/src/utils/deckValidator';
import { 
  GameState, 
  UNIT_CARDS,
  GameCard,
  DeckRules,
  UnitCard,
} from "@card-game/shared";
import { EnemyManager } from "./enemy/EnemyManager";
import { PlayerManager } from "./player/PlayerManager";
import { AbilityManager } from "./abilities/AbilityManager";
import { v4 as uuidv4 } from 'uuid';
import { createInitialGameState } from "./GameStateFactory";

export class GameLogic {
  private state: GameState;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private abilityManager: AbilityManager;

  constructor(playerDeck?: string[]) {
    this.state = this.initializeGame(playerDeck);
    this.enemyManager = new EnemyManager(() => this.state);
    this.playerManager = new PlayerManager(
        () => this.state, 
        () => this.checkGameOver()
    );
    this.abilityManager = new AbilityManager();
    this.state.enemy = this.enemyManager.spawnNewEnemy(this.state);
  }

  public getState(): GameState {
    return this.state;
  }

  private initializeGame(playerDeck?: string[]): GameState {
    const state = createInitialGameState();
    
    let deckCardIds: string[] = [];

    //  전달받은 덱이 있으면 유효성 검증 후 사용
    //  테스트용으로 덱이 없으면 기본 덱을 생성하는 로직 추가
    if (playerDeck && playerDeck.length > 0) {
      const validation = validateDeck(playerDeck);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      deckCardIds = playerDeck;
    } else {
      deckCardIds = this.generateDefaultDeck();
    }

    // 2. ID 목록을 실제 게임 카드 인스턴스로 변환
    const rawDeck = this.initializeDeck(deckCardIds, state.player.id);
    const deck = this.shuffleDeck(rawDeck);

    // 핸드 드로우 (5장)
    const hand = deck.splice(0, 5);

    // 생성된 상태에 덱과 핸드 정보 업데이트
    state.deck = deck;
    state.hand = hand;

    return state;
  }

  // 테스트용 기본 덱 생성 (랜덤하게 20장 채우기)
  private generateDefaultDeck(): string[] {
    const deckIds: string[] = [];
    // UNIT_CARDS가 배열이라고 가정
    const availableCards = Object.values(UNIT_CARDS); 

    if (availableCards.length === 0) return [];

    while (deckIds.length < DeckRules.MIN_DECK_SIZE) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      
      // 현재 덱에 포함된 해당 카드의 개수 확인
      const currentCount = deckIds.filter(id => id === randomCard.cardId).length;

      // 최대 매수 제한(3장)을 넘지 않으면 추가
      if (currentCount < DeckRules.MAX_COPIES_PER_CARD) {
        deckIds.push(randomCard.cardId);
      }
    }

    return deckIds;
  }

  // 게임 시작 시 덱 초기화 함수
  private initializeDeck(deckCardIds: string[], playerId: string): GameCard[] {
    return deckCardIds.map((cardId) => {
      const originalData = Object.values(UNIT_CARDS).find((c: UnitCard) => c.cardId === cardId);
      
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

  public activateAbility(playerId: string, cardInstanceId: string, abilityIndex: number): { success: boolean; message?: string } {
    const state = this.state;
    if (state.player.id !== playerId) {
      return { success: false, message: "잘못된 플레이어입니다." };
    }

    const unitIndex = state.playerField.findIndex(u => u?.id === cardInstanceId);
    if (unitIndex === -1) {
      return { success: false, message: "카드가 필드에 없습니다." };
    }
    
    const unitInstance = state.playerField[unitIndex]!;
    const cardData = UNIT_CARDS.find(c => c.cardId === unitInstance.cardId);
    
    if (!cardData?.abilities || !cardData.abilities[abilityIndex]) {
      return { success: false, message: "유효하지 않은 능력입니다." };
    }

    const ability = cardData.abilities[abilityIndex];
    this.abilityManager.executeAbility(this.state, playerId, cardInstanceId, ability);
    return { success: true };
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
    } else if (this.state.turn > 50) {
      this.state.gameStatus = "victory";
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
