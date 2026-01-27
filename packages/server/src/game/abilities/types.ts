import { Ability, GameState } from "@card-game/shared";

export interface AbilityHandler {
  execute(
    gameState: GameState, 
    playerId: string, 
    cardInstanceId: string, 
    ability: Ability
  ): void;
}