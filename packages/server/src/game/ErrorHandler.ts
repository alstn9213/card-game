import { Socket } from "socket.io";
import { 
  ServerEvents, 
  ErrorCode, 
  createError, 
  GameError, 
  ClientToServerEvents, 
  ServerToClientEvents 
} from "@card-game/shared";

export class ErrorHandler {
  constructor(private socket: Socket<ClientToServerEvents, ServerToClientEvents>) {}

  public handleError(error: unknown, failCode: ErrorCode): void {
    if (this.isGameError(error)) {
      this.socket.emit(ServerEvents.ERROR, error);
    } else {
      this.socket.emit(ServerEvents.ERROR, createError(failCode));
    }
  }

  private isGameError(error: unknown): error is GameError {
    return typeof error === "object" && error !== null && "code" in error && "message" in error;
  }
}
