import { useState, useCallback, useEffect } from "react";
import type { ClientToServerEvents, GameState, ServerToClientEvents } from "@card-game/shared";
import { io, type Socket } from "socket.io-client";

// 소켓 인스턴스를 컴포넌트 외부에서 생성하여 리렌더링 시에도 연결 유지
// 실제 배포 시에는 환경변수(import.meta.env.VITE_API_URL) 등을 사용해야 함
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000", {
  autoConnect: false, // 필요할 때 연결하기 위해 false 설정
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // 1. 소켓 연결
    socket.connect();

    // 2. 이벤트 리스너 등록
    function onConnect() {
      setIsConnected(true);
      console.log("Connected to server");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected from server");
    }

    function onGameStateUpdate(newState: GameState) {
      console.log("Game state updated:", newState);
      setGameState(newState);
    }

    function onError(message: string) {
      alert(`Error: ${message}`); // 간단한 에러 처리
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("gameStateUpdate", onGameStateUpdate);
    socket.on("error", onError);

    // 3. 클린업 (컴포넌트 언마운트 시 리스너 제거)
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("gameStateUpdate", onGameStateUpdate);
      socket.off("error", onError);
      socket.disconnect();
    };
  }, []);

  // 4. 액션 함수 정의 (서버로 이벤트 전송)
  const playCard = useCallback((cardIndex: number) => {
    socket.emit("playCard", cardIndex);
  }, []);

  const endTurn = useCallback(() => {
    socket.emit("endTurn");
  }, []);

  const attack = useCallback((attackerId: string, targetId: string) => {
    socket.emit("attack", attackerId, targetId);
  }, []);

  return {
    gameState,
    isConnected,
    playCard,
    endTurn,
    attack,
  };
};