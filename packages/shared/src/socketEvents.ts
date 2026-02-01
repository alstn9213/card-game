import type { GameState } from "./interfaces";
import type { GameError } from "./errors";

export const ClientEvents = {
  JOIN_GAME: "joinGame",
  PLAY_CARD: "playCard",
  END_TURN: "endTurn",
  ATTACK: "attack",
  ACTIVATE_ABILITY: "activateAbility",
  CONTINUE_ROUND: "continueRound",
  BUY_CARD: "buyCard",
} as const;

export type ClientToServerEvents = {
  [ClientEvents.JOIN_GAME]: (deck: string[]) => void;
  [ClientEvents.PLAY_CARD]: (cardIndex: number, targetId?: string) => void;
  [ClientEvents.END_TURN]: () => void;
  [ClientEvents.ATTACK]: (attackerId: string, targetId: string) => void;
  [ClientEvents.ACTIVATE_ABILITY]: (cardInstanceId: string, abilityIndex: number, targetId?: string) => void;
  [ClientEvents.CONTINUE_ROUND]: () => void;
  [ClientEvents.BUY_CARD]: (cardIndex: number) => void;
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
