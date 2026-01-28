import { CardType, FieldUnit, GameState, GameStatus, ErrorCode, GameError, TargetSource, GameCard, DeckRules } from "@card-game/shared";
import { GameUtils } from "../utils/GameUtils";
import { v4 as uuidv4 } from 'uuid';
import { createError } from "../GameErrors";

export class PlayerManager {

  constructor(
    private getState: () => GameState,
    private checkGameOver: () => void
  ) {
  }

  public playCard(cardIndex: number): void {
    const state = this.getState();
    this.validatePlayCard(state, cardIndex);

    const card = state.hand[cardIndex]!;

    if (card.type === CardType.UNIT) {
       this.playUnitCard(state, card as FieldUnit);
    } 

    // 자원 소모 및 뒷정리
    state.currentGold -= card.cost;
    state.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    this.checkGameOver();
  }

  // 공격 함수
  public attack(attackerId: string, targetId: string): void {
    const state = this.getState();
    this.validateAttack(state, attackerId, targetId);

    const attacker = state.playerField.find(u => u?.id === attackerId)!;
    const targetResult = GameUtils.findTarget(state, targetId);
    const { target } = targetResult;

    target!.currentHp -= attacker.attackPower;
    
    // 공격 로그 기록
    state.attackLogs.push({
      attackerId,
      targetId,
      damage: attacker.attackPower
    });

    attacker.hasAttacked = true;

    GameUtils.processUnitDeath(state, targetResult);

    this.checkGameOver();
  }

  // 라운드 시작시, 조건 초기화 함수
  public onTurnStart() {
    const state = this.getState();

    // 유닛 공격권 초기화
    state.playerField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    // 턴 시작 시 카드 드로우
    this.drawCard(state);
  }

  // 상점 카드 구매
  public buyCard(cardIndex: number): void {
    const state = this.getState();
    
    if (state.gameStatus !== GameStatus.SHOP) {
      throw createError(ErrorCode.UNKNOWN_ERROR, "상점 단계가 아닙니다.");
    }

    const cardData = state.shopItems[cardIndex];
    if (!cardData) {
      throw createError(ErrorCode.CARD_NOT_FOUND, "상품을 찾을 수 없습니다.");
    }

    // 보유 한도 체크 (3장 제한)
    const currentCount = state.deck.filter(c => c.cardId === cardData.cardId).length;
    if (currentCount >= DeckRules.MAX_COPIES_PER_CARD) {
      throw createError(ErrorCode.UNKNOWN_ERROR, "해당 카드는 보유 한도(3장)를 초과하여 구매할 수 없습니다.");
    }

    if (state.currentGold < cardData.cost) {
      throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    }

    // 구매 처리
    state.currentGold -= cardData.cost;
    
    // 덱에 추가 (새 인스턴스 생성)
    const newCard: GameCard = { ...cardData, id: uuidv4(), ownerId: state.player.id };
    // 덱의 맨 뒤에 추가 (다음 드로우 사이클에 등장)
    state.deck.push(newCard);
    state.shopItems.splice(cardIndex, 1); // 구매한 카드는 목록에서 제거
  }

  // 카드 드로우 로직
  private drawCard(state: GameState) {
    // 핸드가 가득 찼으면(5장) 드로우하지 않음
    if (state.hand.length >= 5) return;

    // 덱이 비어있다면 묘지를 섞어 덱으로 보충
    if (state.deck.length === 0) {
      if (state.discardPile.length > 0) {
        // 묘지의 카드를 덱으로 이동 후 셔플
        state.deck = GameUtils.shuffleArray([...state.discardPile]);
        state.discardPile = [];
      } else {
        return; // 덱과 묘지 모두 비었음 (탈진)
      }
    }

    const card = state.deck.shift();
    if (card) {
      state.hand.push(card);
    }
  }

  // --- 헬퍼 함수 ---
  
  private validatePlayCard(state: GameState, cardIndex: number): void {
    if (!state.isPlayerTurn || state.gameStatus !== GameStatus.PLAYING) {
       throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    const card = state.hand[cardIndex];
    if (!card) throw createError(ErrorCode.CARD_NOT_FOUND);
    if (state.currentGold < card.cost) throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    
    if (card.type === CardType.UNIT) {
       const hasEmptySlot = state.playerField.some(slot => slot === null);
       if (!hasEmptySlot) throw createError(ErrorCode.FIELD_FULL);
    }
  }

  private validateAttack(state: GameState, attackerId: string, targetId: string): void {
    if (!state.isPlayerTurn || state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    const attacker = state.playerField.find(u => u?.id === attackerId);
    if (!attacker) throw createError(ErrorCode.NO_UNIT_TO_ATTACK);
    if (attacker.hasAttacked) throw createError(ErrorCode.ALREADY_ATTACKED);

    const { target, source } = GameUtils.findTarget(state, targetId);

    if (!target) throw createError(ErrorCode.TARGET_NOT_FOUND);
    
    // PlayerManager는 적군만 공격 가능하므로 유효성 검사 추가
    if (source !== TargetSource.ENEMY_FIELD) throw createError(ErrorCode.ATTACK_ENEMY_ONLY);
  }

  private playUnitCard(state: GameState, card: FieldUnit) {
    const emptySlotIndex = state.playerField.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return; // validatePlayCard에서 체크했지만 안전장치

    const newUnit: FieldUnit = {
      id: uuidv4(),
      ownerId: state.player.id,
      cardId: card.id,
      name: card.name,
      cost: card.cost,
      type: card.type,
      targetType: card.targetType,
      description: card.description,
      attackPower: card.attackPower,
      maxHp: card.maxHp,
      currentHp: card.maxHp,
      hasAttacked: false, 
    };
    state.playerField[emptySlotIndex] = newUnit;
  }

  
}