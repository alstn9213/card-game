import { useCallback } from "react";
import { ClientEvents, type ClientToServerEvents, type ServerToClientEvents, } from "@card-game/shared";
import { Socket } from "socket.io-client";

export const useShopActions = (socket: Socket<ServerToClientEvents, ClientToServerEvents> | null) => {
  
  const buyCard = useCallback((index: number) => {
    if (!socket) return;
    socket.emit(ClientEvents.BUY_CARD, index);
  }, [socket]);

  const continueRound = useCallback(() => {
    if (!socket) return;
    socket.emit(ClientEvents.CONTINUE_ROUND);
  }, [socket]);

  return {
    buyCard,
    continueRound,
  };
};