import './GameBoard.css'; 
import { useGameState } from '../hooks/useGameState';
import { useGameInteraction } from '../hooks/useGameInteraction';
import { UnitSlot } from './UnitSlot';
import type { GameState } from '@card-game/shared';

interface UseGameStateResult {
  gameState: GameState | null;
  isConnected: boolean;
  playCard: (cardIndex: number) => void;
  endTurn: () => void;
  attack: (attackerId: string, targetId: string) => void;
}

export const GameBoard = () => {
  const { gameState, isConnected, playCard, endTurn, attack } = useGameState() as UseGameStateResult;
  
  const { selectedAttackerId, handlePlayerUnitClick, handleEnemyClick } = useGameInteraction(
    gameState?.isPlayerTurn ?? false,
    attack
  );

  if (!isConnected) {
    return <div className="loading">서버에 연결 중입니다...</div>;
  }

  if (!gameState) {
    return <div className="loading">로딩중...</div>;
  }
  console.log("현재 게임 상태:", gameState);
  console.log("내 필드:", gameState.playerField);
  console.log("적 필드:", gameState.enemyField);

  const { currentGold, isPlayerTurn } = gameState;

  return (
    <div className="game-board">
      {/* 최상단 상태 바 */}
      <div className="status-bar">
        TURN {gameState.turn} — {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}
      </div>

      {/* 1. 적 영역 */}
      <div className="enemy-area" onClick={() => handleEnemyClick("enemy")}>
        <div className="enemy-info">
          <div className="avatar enemy-avatar">
            HP {gameState.enemy.currentHp}
          </div>
          <div>Enemy Player</div>
        </div>
        
        {/* 적 필드 */}
        <div className="field-row enemy-field">
            {gameState.enemyField && gameState.enemyField.map((unit, i) => (
                <UnitSlot 
                  key={i} 
                  unit={unit} 
                  onClick={(e) => {
                    e?.stopPropagation(); 
                    if (unit) handleEnemyClick(unit.id);
                  }}
                />
            ))}
        </div>
      </div>

      {/* 2. 중앙 전장 (플레이어 필드) */}
      <div className="battle-zone">
        <div className="field-row player-field">
          {gameState.playerField && gameState.playerField.map((unit, i) => (
            <UnitSlot 
              key={i} 
              unit={unit} 
              isSelected={unit?.id === selectedAttackerId}
              onClick={() => unit && handlePlayerUnitClick(unit)}
            />
          ))}
        </div>
      </div>

      {/* 3. 플레이어 영역 */}
      <div className="player-area">
        {/* 플레이어 상태 바 (아바타, 골드, 턴 종료) */}
        <div className="player-status-bar">
           <div className="avatar player-avatar">
              HP {gameState.player.currentHp}
           </div>
           <div className="resource-display">
             💰 {currentGold}
           </div>
           <button 
             className="end-turn-btn" 
             onClick={endTurn}
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
                key={index} 
                className="card" 
                onClick={() => playCard(index)}
              >
                <div className="card-cost">{card.cost}</div>
                <div className="card-content">
                  <div className="card-name">{card.name}</div>
                </div>
                {/* 유닛일 경우 스탯 표시 */}
                {card.type === 'UNIT' && (
                   <div className="card-stats">
                      <div className="stat-badge" style={{background: '#e67e22'}}>
                        {(card as any).attackPower}
                      </div>
                      <div className="stat-badge" style={{background: '#e74c3c'}}>
                        {(card as any).hp}
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};