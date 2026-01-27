import { useContext } from "react";
import { GameContext } from "./GameContext";

export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider");
  }
  return context;
};