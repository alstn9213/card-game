import { useState, useEffect } from 'react';
import { useGameState } from './GameContext';
import { ServerEvents } from '@card-game/shared';


export const useSpellCastEffect = () => {
    const { socket } = useGameState();
    const [spellEffect, setSpellEffect] = useState<{ cardId: string, targetId?: string, key: number } | null>(null);

    useEffect(() => {
        if (!socket) {
          console.warn("[useSpellCastEffect] socket이 없습니다.");
          return;
        }

        const handleSpellCast = (data: { cardId: string; targetId?: string }) => {
          setSpellEffect({ ...data, key: Date.now() });
        };

        socket.on(ServerEvents.SPELL_CAST, handleSpellCast);

        return () => {
          socket.off(ServerEvents.SPELL_CAST, handleSpellCast);
        };
    }, [socket]);

    return spellEffect;
};