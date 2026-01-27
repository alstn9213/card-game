import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState } from "@card-game/shared";

const SOCKET_URL = "http://localhost:3000";

export const useGameState = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
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

    newSocket.on("gameStateUpdate", (newState: GameState) => {
      setGameState(newState);
    });

    newSocket.on("error", (message: string) => {
      console.error("Server Error:", message);
      setError(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startGame = useCallback((deck: string[]) => {
    if (socket) {
      socket.emit("joinGame", deck);
    }
  }, [socket]);

  const playCard = useCallback((cardIndex: number) => {
    socket?.emit("playCard", cardIndex);
  }, [socket]);

  const endTurn = useCallback(() => {
    socket?.emit("endTurn");
  }, [socket]);

  const attack = useCallback((attackerId: string, targetId: string) => {
    socket?.emit("attack", attackerId, targetId);
  }, [socket]);

  const activateAbility = useCallback((cardInstanceId: string, abilityIndex: number) => {
    socket?.emit("activateAbility", cardInstanceId, abilityIndex);
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