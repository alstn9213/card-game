import { Ability } from "@card-game/shared";
import { GameSession } from "../GameSession";

export interface AbilityHandler {
  execute(
    session: GameSession, 
    playerId: string, 
    cardInstanceId: string, 
    ability: Ability
  ): void;
}