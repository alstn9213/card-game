import type { GameState, GameError } from "./interfaces";

export const ClientEvents = {
  JOIN_GAME: "joinGame",
  PLAY_CARD: "playCard",
  END_TURN: "endTurn",
  ATTACK: "attack",
  ACTIVATE_ABILITY: "activateAbility",
} as const;

export type ClientToServerEvents = {
  [ClientEvents.JOIN_GAME]: (deck: string[]) => void;
  [ClientEvents.PLAY_CARD]: (cardIndex: number) => void;
  [ClientEvents.END_TURN]: () => void;
  [ClientEvents.ATTACK]: (attackerId: string, targetId: string) => void;
  [ClientEvents.ACTIVATE_ABILITY]: (cardInstanceId: string, abilityIndex: number, targetId?: string) => void;
};

export const ServerEvents = {
  GAME_STATE_UPDATE: "gameStateUpdate",
  ERROR: "error",
  GAME_LOG: "gameLog",
} as const;

export type ServerToClientEvents = {
  [ServerEvents.GAME_STATE_UPDATE]: (state: GameState) => void;
  [ServerEvents.ERROR]: (error: GameError) => void;
  [ServerEvents.GAME_LOG]: (message: string) => void;
};
