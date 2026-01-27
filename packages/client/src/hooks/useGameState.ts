import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { 
  type GameState, 
  type GameError,
  ClientEvents, 
  ServerEvents, 
  type ClientToServerEvents, 
  type ServerToClientEvents 
} from "@card-game/shared";

const SOCKET_URL = "http://localhost:3000";

export const useGameState = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<GameError | null>(null);

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on(ServerEvents.GAME_STATE_UPDATE, (newState: GameState) => {
      setGameState(newState);
    });

    newSocket.on(ServerEvents.ERROR, (err: GameError) => {
      console.error("Server Error:", err.message);
      setError(err);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

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

  return {
    gameState,
    isConnected,
    startGame,
    playCard,
    endTurn,
    attack,
    activateAbility,
    resetGame,
    error,
    clearError,
  };
};