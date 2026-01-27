import { GameState, UNIT_CARDS, ErrorCode } from "@card-game/shared";
import { AbilityHandler } from "./types";
import { EffectType } from "@card-game/shared";
import { TransformHandler } from "./handlers/TransformHandler";
import { DamageHandler } from "./handlers/DamageHandler";
import { createError } from "../GameErrors";

export class AbilityManager {
  private handlers: Record<string, AbilityHandler> = {};

  constructor() {
    this.registerHandler(EffectType.TRANSFORM, new TransformHandler());
    this.registerHandler(EffectType.DAMAGE, new DamageHandler());
  }

  private registerHandler(type: string, handler: AbilityHandler) {
    this.handlers[type] = handler;
  }

  public executeAbility(gameState: GameState, playerId: string, cardInstanceId: string, abilityIndex: number, targetId?: string) {
    // 1. 유닛 찾기
    const unitInstance = gameState.playerField.find(u => u?.id === cardInstanceId);
    if (!unitInstance) {
      throw createError(ErrorCode.CARD_NOT_ON_FIELD);
    }

    // 2. 카드 데이터 및 능력 찾기
    const cardData = UNIT_CARDS.find(c => c.cardId === unitInstance.cardId);
    if (!cardData?.abilities || !cardData.abilities[abilityIndex]) {
      throw createError(ErrorCode.INVALID_ABILITY);
    }

    const ability = cardData.abilities[abilityIndex];
    const handler = this.handlers[ability.type];
    
    if (!handler) {
      console.warn(`[AbilityManager] 핸들러가 없는 능력입니다: ${ability.type}`);
      throw createError(ErrorCode.ABILITY_USE_FAILED, "지원하지 않는 능력입니다.");
    }

    // 해당 핸들러에게 일임
    handler.execute(gameState, playerId, cardInstanceId, ability, targetId);
  }
}