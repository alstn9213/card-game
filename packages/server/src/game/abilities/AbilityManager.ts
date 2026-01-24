import { GameSession } from "../GameSession";
import { Ability,  } from "@card-game/shared/src/interfaces"; // Shared에서 수정했던 EffectType 사용
import { AbilityHandler } from "./types";
import { EffectType } from "@card-game/shared";
import { TransformHandler } from "./handlers/TransformHandler";

export class AbilityManager {
  private handlers: Record<string, AbilityHandler> = {};

  constructor() {
    // 여기서 핸들러들을 등록합니다.
    this.registerHandler(EffectType.TRANSFORM, new TransformHandler());
    // this.registerHandler(EffectType.DAMAGE, new DamageHandler()); // 나중에 추가
  }

  private registerHandler(type: string, handler: AbilityHandler) {
    this.handlers[type] = handler;
  }

  public executeAbility(session: GameSession, playerId: string, cardInstanceId: string, ability: Ability) {
    const handler = this.handlers[ability.type];
    
    if (!handler) {
      console.warn(`[AbilityManager] 핸들러가 없는 능력입니다: ${ability.type}`);
      return;
    }

    // 해당 핸들러에게 일임
    handler.execute(session, playerId, cardInstanceId, ability);
  }
}