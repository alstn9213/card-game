import { ErrorCode, createError } from "@card-game/shared";
import { GameContext } from "./GameContextFactory";

export abstract class BaseGameManager {
  constructor(
    protected getGameContext: () => GameContext | null,
    protected broadcastState: () => void,
    protected onError: (error: unknown, code: ErrorCode, context: string) => void
  ) {}

  protected validateContext(): GameContext {
    const context = this.getGameContext();
    if (!context) {
      throw createError(ErrorCode.GAME_NOT_STARTED);
    }
    return context;
  }
}