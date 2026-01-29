import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import {
  type GameState,
  type GameError,
  ClientEvents,
  ServerEvents,
  type ClientToServerEvents,
  type ServerToClientEvents
} from "@card-game/shared";

interface GameContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  gameState: GameState | null;
  isConnected: boolean;
  error: GameError | null;
  startGame: (deck: string[]) => void;
  playCard: (cardIndex: number) => void;
  endTurn: () => void;
  attack: (attackerId: string, targetId: string) => void;
  activateAbility: (cardInstanceId: string, abilityIndex: number, targetId?: string) => void;
  resetGame: () => void;
  clearError: () => void;
}

export const GameContext = createContext<GameContextType | null>(null);



const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const SOCKET_OPTIONS = {
  transports: ["websocket"],
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<GameError | null>(null);

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
      setGameState(newState);
    });

    newSocket.on(ServerEvents.ERROR, (err: GameError) => {
      setError(err);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 에러 발생 시 3초 후 자동 소멸 (Toast 효과)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startGame = useCallback((deck: string[]) => {
    if (socket) {
      socket.emit(ClientEvents.JOIN_GAME, deck);
    }
  }, [socket]);

  const playCard = useCallback((cardIndex: number) => {
    socket?.emit(ClientEvents.PLAY_CARD, cardIndex);
  }, [socket]);

  const endTurn = useCallback(() => {
    socket?.emit(ClientEvents.END_TURN);
  }, [socket]);

  const attack = useCallback((attackerId: string, targetId: string) => {
    socket?.emit(ClientEvents.ATTACK, attackerId, targetId);
  }, [socket]);

  const activateAbility = useCallback((cardInstanceId: string, abilityIndex: number, targetId?: string) => {
    socket?.emit(ClientEvents.ACTIVATE_ABILITY, cardInstanceId, abilityIndex, targetId);
  }, [socket]);

  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <GameContext.Provider
      value={{ socket, gameState, isConnected, error, startGame, playCard, endTurn, attack, activateAbility, resetGame, clearError }}
    >
      {children}
    </GameContext.Provider>
  );
};