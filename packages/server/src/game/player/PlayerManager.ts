import { CardType, FieldUnit, GameState, UnitCard } from "@card-game/shared";
import { GameUtils } from "../utils/GameUtils";

export class PlayerManager {

  constructor(
    private getState: () => GameState,
    private checkGameOver: () => void
  ) {
  }

  public playCard(cardIndex: number): { success: boolean; message?: string } {
    const state = this.getState();

    const error = this.validatePlayCard(state, cardIndex);
    if (error) return { success: false, message: error };

    const card = state.hand[cardIndex]!;

    // 카드 타입별 로직
    if (card.type === CardType.UNIT) {
       this.playUnitCard(state, card as UnitCard);

    } 

    // 자원 소모 및 뒷정리
    state.currentGold -= card.cost;
    state.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    this.checkGameOver();
    return { success: true };
  }

  // 공격 함수
  public attack(attackerId: string, targetId: string): { success: boolean; message?: string } {
    const state = this.getState();
    const error = this.validateAttack(state, attackerId, targetId);
    if (error) return { success: false, message: error };

    const attacker = state.playerField.find(u => u?.id === attackerId)!;
    const targetResult = GameUtils.findTarget(state, targetId);
    const { target } = targetResult;

    target!.currentHp -= attacker.attackPower;
    attacker.hasAttacked = true;

    GameUtils.processUnitDeath(state, targetResult);

    this.checkGameOver();

    return { success: true };
  }


  // --- 헬퍼 함수 ---
  
  private validatePlayCard(state: GameState, cardIndex: number): string | null {
    if (!state.isPlayerTurn || state.gameStatus !== "playing") {
      return "상대 차례입니다";
    }
    const card = state.hand[cardIndex];
    if (!card) return "카드가 존재하지 않습니다.";
    if (state.currentGold < card.cost) return "금화가 부족합니다.";
    
    if (card.type === CardType.UNIT) {
       const hasEmptySlot = state.playerField.some(slot => slot === null);
       if (!hasEmptySlot) return "필드가 가득 찼습니다";
    }
    return null;
  }

  private validateAttack(state: GameState, attackerId: string, targetId: string): string | null {
    if (!state.isPlayerTurn || state.gameStatus !== "playing") {
      return "공격할 수 없는 상태입니다.";
    }
    const attacker = state.playerField.find(u => u?.id === attackerId);
    if (!attacker) return "공격할 유닛이 없습니다.";
    if (attacker.hasAttacked) return "이미 공격한 유닛입니다.";

    const { target, source } = GameUtils.findTarget(state, targetId);
    if (!target) return "대상을 찾을 수 없습니다.";
    // PlayerManager는 적군만 공격 가능하므로 유효성 검사 추가
    if (source !== "enemy-hero" && source !== "enemy-field") return "적군만 공격할 수 있습니다.";

    return null;
  }

  private playUnitCard(state: GameState, card: UnitCard) {
    const emptySlotIndex = state.playerField.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return; // validatePlayCard에서 체크했지만 안전장치

    const newUnit: FieldUnit = {
      id: Math.random().toString(36).substr(2, 9),
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
}