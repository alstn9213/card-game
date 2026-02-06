import React, { useState, useEffect, useRef } from "react";
import type { GameState, CardData } from "@card-game/shared";
import { Card } from "../Card";
import { v4 as uuidv4 } from 'uuid';
import "../../css/PlayerArea.css";


interface PlayerAreaProps {
  gameState: GameState;
  isPlayerTurn: boolean;
  playerDamage: { id: string; text: string } | null;
  setUnitRef: (id: string, el: HTMLDivElement | null) => void;
  onEndTurn: () => void;
  onPlayCard: (index: number) => void;
  onCardDragStart?: (e: React.DragEvent, card: CardData, index: number) => void;
  onCardDragEnd?: () => void;
}

export const PlayerArea = ({ 
  gameState, 
  isPlayerTurn, 
  playerDamage, 
  setUnitRef, 
  onEndTurn, 
  onCardDragStart,
  onCardDragEnd
}: PlayerAreaProps) => {
  const prevGoldRef = useRef(gameState.currentGold);
  const [goldEffects, setGoldEffects] = useState<{ id: string; value: number }[]>([]);

  useEffect(() => {
    if (gameState.currentGold > prevGoldRef.current) {
      const diff = gameState.currentGold - prevGoldRef.current;
      const newEffect = { id: uuidv4(), value: diff };
      setGoldEffects(prev => [...prev, newEffect]);
      setTimeout(() => {
        setGoldEffects(prev => prev.filter(e => e.id !== newEffect.id));
      }, 800);
    }
    prevGoldRef.current = gameState.currentGold;
  }, [gameState.currentGold]);

  return (
    <div 
      className="player-area" 
      style={{ position: 'relative' }}
      onDragOver={(e) => e.stopPropagation()}
      onDrop={(e) => e.stopPropagation()}
    >
      {/* 플레이어 상태 바 */}
      <div className="player-status-bar">
         <div className="avatar player-avatar" ref={(el) => setUnitRef("player", el)}>
            {playerDamage && <div key={playerDamage.id} className="floating-damage">{playerDamage.text}</div>}
            HP {gameState.player.currentHp}
         </div>
         <div className="resource-display" style={{ position: 'relative' }}>
           💰 {gameState.currentGold}
           {goldEffects.map(effect => (
             <div key={effect.id} className="floating-gold">+{effect.value}</div>
           ))}
         </div>
         <button 
           className="end-turn-btn" 
           onClick={(e) => {
             e.stopPropagation();
             onEndTurn();
           }}
           disabled={!isPlayerTurn}
         >
           턴 종료
         </button>
      </div>
      
      {/* 패 */}
      <div className="hand-container">
        <div className="hand">
          {gameState.hand.map((card, index) => (
            <Card 
              key={card.id} 
              card={card}
              variant="hand"
              style={{ position: 'relative', cursor: 'grab' }}
              draggable={true}
              onDragStart={(e) => onCardDragStart?.(e, card, index)}
              onDragEnd={onCardDragEnd}
            />
          ))}
        </div>
      </div>

      {/* 덱 UI 표시 */}
      <div className="deck-pile">
          <div className="deck-label">DECK</div>
          <div className="deck-count-badge">
            {gameState.deck.length}
          </div>
      </div>
    </div>
  );
};
