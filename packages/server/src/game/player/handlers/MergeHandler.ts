import { GameState, ErrorCode, createError, FieldUnit, UnitCard, TargetSource } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";

export class MergeHandler {
  constructor(private getState: () => GameState) {}

  public execute(source: number | string, targetId: string): FieldUnit {
    if (typeof source === "number") {
      return this.handleHandMerge(source, targetId);
    } else {
      return this.handleFieldMerge(source, targetId);
    }
  }

  // --- 헬퍼 메서드 ---
  
  private handleHandMerge(cardIndex: number, targetId: string): FieldUnit {
    const state = this.getState();
    const card = state.hand[cardIndex];

    if (!card) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    const targetResult = GameUtils.findTarget(state, targetId);
    if (targetResult.source !== TargetSource.PLAYER_FIELD || !targetResult.target) {
      throw createError(ErrorCode.TARGET_NOT_FOUND);
    }

    const targetUnit = targetResult.target as FieldUnit;
    if (targetUnit.cardId !== card.cardId) {
      throw createError(ErrorCode.TARGET_NOT_FOUND);
    }

    if (state.currentGold < card.cost) {
      throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    }

    state.currentGold -= card.cost;
    state.hand.splice(cardIndex, 1);

    const materialCard = card as unknown as UnitCard;
    this.applyMergeStats(targetUnit, {
      maxHp: materialCard.maxHp,
      attackPower: materialCard.attackPower,
      currentHp: materialCard.maxHp,
      stack: 1
    });
    return targetUnit;
  }

  private handleFieldMerge(sourceUnitId: string, targetUnitId: string): FieldUnit {
    const state = this.getState();
    
    const sourceIndex = state.playerField.findIndex(u => u?.id === sourceUnitId);
    const targetIndex = state.playerField.findIndex(u => u?.id === targetUnitId);

    if (sourceIndex === -1 || targetIndex === -1) {
      throw createError(ErrorCode.CARD_NOT_ON_FIELD);
    }

    const sourceUnit = state.playerField[sourceIndex]!;
    const targetUnit = state.playerField[targetIndex]!;

    if (sourceUnit.cardId !== targetUnit.cardId) {
      throw createError(ErrorCode.TARGET_NOT_FOUND);
    }

    this.applyMergeStats(targetUnit, {
      maxHp: sourceUnit.maxHp,
      attackPower: sourceUnit.attackPower,
      currentHp: sourceUnit.currentHp,
      stack: sourceUnit.cardStack || 1
    });

    state.playerField[sourceIndex] = null;
    return targetUnit;
  }

  private applyMergeStats(target: FieldUnit, source: { maxHp: number, attackPower: number, currentHp: number, stack: number }): void {
    target.maxHp += source.maxHp;
    target.attackPower += source.attackPower;
    target.currentHp = Math.min(target.currentHp + source.currentHp, target.maxHp);
    target.cardStack = (target.cardStack || 1) + source.stack;
  }
}