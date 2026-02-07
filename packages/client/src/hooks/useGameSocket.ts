import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import { io, Socket } from "socket.io-client";
import {
  type GameState,
  type GameError,
  ServerEvents,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "@card-game/shared";
import { calculateSyncedState } from "../utils/GameLogUtils";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const SOCKET_OPTIONS = {
  transports: ["websocket"],
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
      const nextState = calculateSyncedState(prevState, newState);

      currentStateRef.current = nextState;
      setGameState(nextState);
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