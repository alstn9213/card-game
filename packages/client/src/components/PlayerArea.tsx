import React from "react";
import type { GameState, CardData } from "@card-game/shared";
import { Card } from "./Card";

interface PlayerAreaProps {
  gameState: GameState;
  isPlayerTurn: boolean;
  playerDamage: { id: string; text: string } | null;
  setUnitRef: (id: string, el: HTMLDivElement | null) => void;
  onEndTurn: () => void;
  onPlayCard: (index: number) => void;
  onDragStateChange?: (card: CardData | null) => void;
}

export const PlayerArea = ({ 
  gameState, 
  isPlayerTurn, 
  playerDamage, 
  setUnitRef, 
  onEndTurn, 
  onDragStateChange
}: PlayerAreaProps) => {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("cardIndex", index.toString());
    e.dataTransfer.effectAllowed = "move";
    onDragStateChange?.(gameState.hand[index]);
  };

  const handleDragEnd = () => {
    onDragStateChange?.(null);
  };

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
         <div className="resource-display">
           💰 {gameState.currentGold}
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
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
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
