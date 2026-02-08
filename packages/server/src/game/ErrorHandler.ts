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
  public static handleError(socket: Socket<ClientToServerEvents, ServerToClientEvents>, error: unknown, failCode: ErrorCode, context: string = "ErrorHandler"): void {
    if (this.isGameError(error)) {
      console.warn(`[${context}] 유저 요청 오류: ${error.message}`);
      socket.emit(ServerEvents.ERROR, error);
    } else {
      console.error(`[${context}] 서버 내부 오류:`, error);
      socket.emit(ServerEvents.ERROR, createError(failCode));
    }
  }

  public static isGameError(error: unknown): error is GameError {
    return typeof error === "object" 
      && error !== null 
      && "code" in error 
      && "message" in error;
  }
}
