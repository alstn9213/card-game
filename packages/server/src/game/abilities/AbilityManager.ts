import { Ability, GameState } from "@card-game/shared";
import { AbilityHandler } from "./types";
import { EffectType } from "@card-game/shared";
import { TransformHandler } from "./handlers/TransformHandler";
import { DamageHandler } from "./handlers/DamageHandler";

export class AbilityManager {
  private handlers: Record<string, AbilityHandler> = {};

  constructor() {
    // 여기서 핸들러들을 등록합니다.
    this.registerHandler(EffectType.TRANSFORM, new TransformHandler());
    this.registerHandler(EffectType.DAMAGE, new DamageHandler());
  }

  private registerHandler(type: string, handler: AbilityHandler) {
    this.handlers[type] = handler;
  }

  public executeAbility(gameState: GameState, playerId: string, cardInstanceId: string, ability: Ability) {
    const handler = this.handlers[ability.type];
    
    if (!handler) {
      console.warn(`[AbilityManager] 핸들러가 없는 능력입니다: ${ability.type}`);
      return;
    }

    // 해당 핸들러에게 일임
    handler.execute(gameState, playerId, cardInstanceId, ability);
  }
}