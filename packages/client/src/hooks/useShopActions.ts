import { useCallback } from "react";
import { ClientEvents, type ClientToServerEvents, type ServerToClientEvents, } from "@card-game/shared";
import { Socket } from "socket.io-client";

export const useShopActions = (socket: Socket<ServerToClientEvents, ClientToServerEvents> | null) => {
  
  // 카드 구매 함수
  const buyCard = useCallback((index: number) => {
    if (!socket) {
      console.warn("[useShopActions] 소켓이 없습니다.");
      return;
    }

    socket.emit(ClientEvents.BUY_CARD, index);
  }, [socket]);

  // 다음 라운드로 넘어가는 함수
  const continueRound = useCallback(() => {
    if (!socket) {
      console.warn("[useShopActions] 소켓이 없습니다.");
      return;
    }

    socket.emit(ClientEvents.CONTINUE_ROUND);
  }, [socket]);

  return {
    buyCard,
    continueRound,
  };
};