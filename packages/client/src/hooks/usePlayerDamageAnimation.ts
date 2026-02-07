import type { GameState } from "@card-game/shared";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useTimeoutManager } from "./useTimeoutManager";

export const usePlayerDamageAnimation = (gameState: GameState | null) => {
  const [playerDamage, setPlayerDamage] = useState<{ id: string; text: string } | null>(null);
  const prevPlayerHp = useRef<number | null>(null);
  const { addTimeout } = useTimeoutManager();

  useEffect(() => {
    if (gameState) {
      if (prevPlayerHp.current !== null && gameState.player.currentHp < prevPlayerHp.current) {
        const dmg = prevPlayerHp.current - gameState.player.currentHp;
        setPlayerDamage({ id: uuidv4(), text: `-${dmg}` });
        addTimeout(() => setPlayerDamage(null), 1000);
      }
      prevPlayerHp.current = gameState.player.currentHp;
    }
  }, [gameState?.player.currentHp, addTimeout]);

  return playerDamage;
};