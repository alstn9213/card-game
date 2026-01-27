import { CardType, FieldUnit, GameState, GameStatus, ErrorCode, GameError, TargetSource } from "@card-game/shared";
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

    // 패가 5장이 될 때까지 드로우
    while (state.hand.length < 5 && state.deck.length > 0) {
      state.hand.push(state.deck.shift()!);
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