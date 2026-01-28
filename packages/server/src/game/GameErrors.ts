import { ErrorCode, GameError, GameErrorMessages } from "@card-game/shared";

export const createError = (code: ErrorCode): GameError => ({
  code,
  message: GameErrorMessages[code] || GameErrorMessages[ErrorCode.UNKNOWN_ERROR]
});
