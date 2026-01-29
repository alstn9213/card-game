import type { GameState, FieldUnit } from "@card-game/shared";

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
            <div 
              key={card.id} 
              className="card draw-effect" 
              onClick={(e) => {
                e.stopPropagation();
                onPlayCard(index);
              }}
              style={{ position: 'relative' }}
            >
              <div className="card-cost">{card.cost}</div>
              <div className="card-content">
                <div className="card-name">{card.name}</div>
              </div>
              {/* 유닛일 경우 스탯 표시 */}
              {card.type === "UNIT" && (
                 <div className="card-stats" style={{
                   position: 'absolute',
                   bottom: '8px',
                   left: 0,
                   width: '100%',
                   display: 'flex',
                   justifyContent: 'space-around',
                   zIndex: 2
                 }}>
                    <div className="stat-badge" style={{background: "#e67e22"}}>
                      {(card as FieldUnit).attackPower}
                    </div>
                    <div className="stat-badge" style={{background: "#e74c3c"}}>
                      {(card as FieldUnit).maxHp}
                    </div>
                 </div>
              )}
            </div>
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
