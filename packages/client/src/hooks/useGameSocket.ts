import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import { io, Socket } from "socket.io-client";
import {
  type GameState,
  type GameError,
  ServerEvents,
  type ClientToServerEvents,
  type ServerToClientEvents
} from "@card-game/shared";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const SOCKET_OPTIONS = {
  transports: ["websocket"],
};

// 데미지 적용 헬퍼 함수 (시각적 동기화용)
export const applyLogToState = (state: GameState, log: { targetId: string; damage: number; attackerId?: string }): GameState => {
  const newState = JSON.parse(JSON.stringify(state));
  
  if (log.targetId === 'player') {
    newState.player.currentHp = Math.max(0, newState.player.currentHp - log.damage);
  } else {
    const pIndex = newState.playerField.findIndex((u: any) => u?.id === log.targetId);
    if (pIndex !== -1 && newState.playerField[pIndex]) {
      newState.playerField[pIndex]!.currentHp -= log.damage;
      if (newState.playerField[pIndex]!.currentHp <= 0) {
        newState.playerField[pIndex] = null;
      }
    }
  }

  // 공격자 상태 업데이트 (공격 모션 후 hasAttacked 처리)
  if (log.attackerId) {
    const eIndex = newState.enemyField.findIndex((u: any) => u?.id === log.attackerId);
    if (eIndex !== -1 && newState.enemyField[eIndex]) {
      newState.enemyField[eIndex]!.hasAttacked = true;
    }
    
    const pIndex = newState.playerField.findIndex((u: any) => u?.id === log.attackerId);
    if (pIndex !== -1 && newState.playerField[pIndex]) {
      newState.playerField[pIndex]!.hasAttacked = true;
    }
  }
  return newState;
};

export const useGameSocket = (
  setGameState: Dispatch<SetStateAction<GameState | null>>,
  setError: (error: GameError) => void,
  setIsConnected: (isConnected: boolean) => void
) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const currentStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, SOCKET_OPTIONS);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on(ServerEvents.GAME_STATE_UPDATE, (newState: GameState) => {
      const prevState = currentStateRef.current;

      // 새로운 공격 로그가 있는지 확인 (적 턴 공격 애니메이션 동기화)
      if (prevState && newState.attackLogs.length > prevState.attackLogs.length) {
        
        // 1. 로그만 먼저 업데이트하여 애니메이션 트리거 (유닛 상태는 이전 상태 유지)
        const tempState = {
          ...newState, // 기본적으로 최신 상태를 따르되 (골드, 핸드 등)
          attackLogs: newState.attackLogs,
          
          // 전투 관련 필드와 플레이어 체력은 이전 상태로 롤백하여 애니메이션 진행
          playerField: prevState.playerField,
          enemyField: prevState.enemyField,
          player: {
            ...newState.player,
            currentHp: prevState.player.currentHp
          }
        };
        
        currentStateRef.current = tempState;
        setGameState(tempState);
      } else {
        currentStateRef.current = newState;
        setGameState(newState);
      }
    });

    newSocket.on(ServerEvents.ERROR, (err: GameError) => {
      setError(err);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [setGameState, setError, setIsConnected]);

  return socket;
};