import { GameState, ErrorCode, createError, FieldUnit, UnitCard } from "@card-game/shared";

export class MergeHandler {
  constructor(private getState: () => GameState) {}

  public execute(cardIndex: number, targetUnit: FieldUnit): void {
    const state = this.getState();
    const card = state.hand[cardIndex];

    if (!card) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    if (state.currentGold < card.cost) {
      throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    }

    state.currentGold -= card.cost;
    state.hand.splice(cardIndex, 1);

    // 패의 카드를 재료로 사용하여 스탯 증가
    const materialCard = card as unknown as UnitCard;
    targetUnit.maxHp += materialCard.maxHp;
    targetUnit.currentHp += materialCard.maxHp; // 최대 체력 증가분만큼 현재 체력 회복
    targetUnit.attackPower += materialCard.attackPower;
    targetUnit.cardStack++;
  }

  public executeFieldMerge(sourceUnitId: string, targetUnitId: string): void {
    const state = this.getState();
    
    const sourceIndex = state.playerField.findIndex(u => u?.id === sourceUnitId);
    const targetIndex = state.playerField.findIndex(u => u?.id === targetUnitId);

    if (sourceIndex === -1 || targetIndex === -1) {
      throw createError(ErrorCode.CARD_NOT_ON_FIELD);
    }

    const sourceUnit = state.playerField[sourceIndex]!;
    const targetUnit = state.playerField[targetIndex]!;

    if (sourceUnit.cardId !== targetUnit.cardId) {
      console.warn("[MergeHandler] cardId가 다릅니다.");
      return;
    }

    targetUnit.maxHp += sourceUnit.maxHp;
    targetUnit.currentHp = Math.min(targetUnit.currentHp + sourceUnit.currentHp, targetUnit.maxHp);
    targetUnit.attackPower += sourceUnit.attackPower;
    targetUnit.cardStack += sourceUnit.cardStack;

    state.playerField[sourceIndex] = null;
  }
}