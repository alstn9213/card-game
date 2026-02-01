import type { GameState, FieldUnit } from "@card-game/shared";
import { Card } from "./Card";

interface PlayerAreaProps {
  gameState: GameState;
  isPlayerTurn: boolean;
  playerDamage: { id: number; text: string } | null;
  setUnitRef: (id: string, el: HTMLDivElement | null) => void;
  onEndTurn: () => void;
  onPlayCard: (index: number) => void;
}

export const PlayerArea = ({ 
  gameState, 
  isPlayerTurn, 
  playerDamage, 
  setUnitRef, 
  onEndTurn, 
  onPlayCard 
}: PlayerAreaProps) => {
  return (
    <div className="player-area" style={{ position: 'relative' }}>
      {/* 플레이어 상태 바 (아바타, 골드, 턴 종료) */}
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
      
      {/* 핸드(손패) */}
      <div className="hand-container">
        <div className="hand">
          {gameState.hand.map((card, index) => (
            <Card 
              key={card.id} 
              card={card}
              variant="hand"
              onClick={(e) => {
                e.stopPropagation();
                onPlayCard(index);
              }}
              style={{ position: 'relative' }}
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
