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
  
  // gameState가 로딩 전일 수 있으므로 안전하게 접근
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

  const { currentGold, isPlayerTurn } = gameState;

  return (
    <div className="game-board">
      <div className="status-bar">
        턴: {gameState.turn} | {isPlayerTurn ? "당신의 차례입니다." : "상대의 차례입니다."}
      </div>

      {/* 1. 적 정보 영역 */}
      <div className="enemy-area" onClick={() => handleEnemyClick("enemy")}>
        <div className="avatar enemy-avatar">
          적 HP: {gameState.enemy.currentHp}
        </div>
        {/* 적 필드 (추후 구현) */}
        <div className="field-row enemy-field">
            {gameState.enemyField && gameState.enemyField.map((unit, i) => (
                <UnitSlot 
                  key={i} 
                  unit={unit} 
                  onClick={(e) => {
                    e?.stopPropagation(); // 부모(enemy-area) 클릭 방지
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

      {/* 3. 플레이어 정보 및 컨트롤 */}
      <div className="player-area">
        <div className="avatar player-avatar">
            플레이어 HP: {gameState.player.currentHp}
        </div>
        <div className="resource-display">
          금화: {currentGold}
        </div>
        
        {/* 핸드(손패) */}
        <div className="hand">
          {gameState.hand.map((card, index) => (
            <div 
              key={index} 
              className="card" 
              onClick={() => playCard(index)}
            >
              <div className="card-cost">{card.cost}</div>
              <div className="card-name">{card.name}</div>
              {/* 유닛일 경우 공격력/체력 표시 */}
              {card.type === 'UNIT' && (
                 <div className="card-stats">
                    {(card as any).attackPower}/{(card as any).hp}
                 </div>
              )}
            </div>
          ))}
        </div>

        <button className="end-turn-btn" onClick={endTurn}>
          턴 종료
        </button>
      </div>
    </div>
  );
};