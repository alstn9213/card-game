import { GameState, UNIT_CARDS, ErrorCode, createError, GameStatus } from "@card-game/shared";
import { AbilityHandler } from "./types";
import { EffectType } from "@card-game/shared";
import { TransformHandler } from "./handlers/TransformHandler";
import { DamageHandler } from "./handlers/DamageHandler";

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
    if (gameState.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }

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
      throw createError(ErrorCode.ABILITY_USE_FAILED);
    }

    // 해당 핸들러에게 일임
    handler.execute(gameState, playerId, cardInstanceId, ability, targetId);
  }
}