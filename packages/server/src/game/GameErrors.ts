import { ErrorCode, GameError } from "@card-game/shared";

export const createError = (code: ErrorCode): GameError => ({
  code,
  message: code
});
