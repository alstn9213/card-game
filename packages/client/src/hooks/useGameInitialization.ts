import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useGameInitialization = (
  isConnected: boolean,
  startGame: (deck: string[]) => void
) => {
  const location = useLocation();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isConnected && startGame && !hasStarted.current) {
      const deck = location.state?.deck || [];
      startGame(deck);
      hasStarted.current = true;
    }
  }, [isConnected, startGame, location.state]);
};