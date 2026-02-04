import { useCallback } from "react";
import { Socket } from "socket.io-client";
import { ClientEvents, type ClientToServerEvents, type ServerToClientEvents, type GameError, createError, ErrorCode } from "@card-game/shared";

export const useGameActions = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  setError: (error: GameError) => void
) => {
  // 연결 상태 확인 헬퍼
  const checkConnection = useCallback(() => {
    if (!socket || !socket.connected) {
      setError(createError(ErrorCode.UNKNOWN_ERROR));
      return false;
    }
    return true;
  }, [socket, setError]);

  const startGame = useCallback((deck: string[]) => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.JOIN_GAME, deck);
    }
  }, [socket, checkConnection]);

  const playCard = useCallback((cardIndex: number, targetId?: string) => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.PLAY_CARD, cardIndex, targetId);
    }
  }, [socket, checkConnection]);

  const endTurn = useCallback(() => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.END_TURN);
    }
  }, [socket, checkConnection]);

  const attack = useCallback((attackerId: string, targetId: string) => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.ATTACK, attackerId, targetId);
    }
  }, [socket, checkConnection]);

  const buyCard = useCallback((index: number) => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.BUY_CARD, index);
    }
  }, [socket, checkConnection]);

  const continueRound = useCallback(() => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.CONTINUE_ROUND);
    }
  }, [socket, checkConnection]);

  const mergeFieldUnits = useCallback((sourceUnitId: string, targetUnitId: string) => {
    if (checkConnection()) {
      socket?.emit(ClientEvents.MERGE_FIELD_UNITS, sourceUnitId, targetUnitId);
    }
  }, [socket, checkConnection]);

  return {
    startGame,
    playCard,
    endTurn,
    attack,
    buyCard,
    continueRound,
    mergeFieldUnits
  };
};