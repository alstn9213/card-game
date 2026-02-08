import { GameContext } from "./GameContextFactory";
import { ErrorCode } from "@card-game/shared";
import { BaseGameManager } from "./BaseGameManager";

export class GameActionManager extends BaseGameManager {
  constructor(
    getGameContext: () => GameContext | null,
    broadcastState: () => void,
    onError: (error: unknown, code: ErrorCode, context: string) => void
  ) {
    super(getGameContext, broadcastState, onError);
  }

  public execute(
    action: (context: GameContext) => void,
    contextName: string = "GameAction"
  ): boolean {
    try {
      const context = this.validateContext();
      action(context);
      context.turnManager.updateGameStatus();
      this.broadcastState();
      return true;

    } catch (error) {
      this.onError(error, ErrorCode.UNKNOWN_ERROR, contextName);
      return false;
    }
  }
}
