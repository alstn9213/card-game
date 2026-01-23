import { useEffect } from 'react';
import { useGameState, type FieldUnit } from '../hooks/useGameState';
import './GameBoard.css'; 

export const GameBoard = () => {
  const { gameState, actions } = useGameState();
  const { player, enemy, hand, turn, log, playerField, enemyField } = gameState;

  useEffect(() => {
    actions.initializeGame();
  }, [actions.initializeGame]);

  // 필드 유닛 렌더링 헬퍼 컴포넌트
  const renderUnit = (unit: FieldUnit) => (
    <div key={unit.instanceId} className="field-unit">
      <div className="unit-stat atk">{unit.canAttack}</div>
      <div className="unit-image">{unit.name[0]}</div>
      <div className="unit-name">{unit.name}</div>
      <div className="unit-stat hp">{unit.currentHp}</div>
    </div>
  );

  return (
    <div className="game-board">
      {/* 적 본체 영역 */}
      <div className="area enemy-area">
        <div className="avatar">👾</div>
        <div className="status-bar">HP: {enemy.hp} / Mana: {enemy.mana}</div>
      </div>

      {/* 전장 (Battle Field) */}
      <div className="battle-field">
        {/* 적 필드 */}
        <div className="field-row enemy-field">
            {enemyField.map(unit => renderUnit(unit))}
            {enemyField.length === 0 && <div className="empty-field-msg">적 필드 비어있음</div>}
        </div>
        
        <div className="field-divider">
            <span className="turn-indicator">{turn === 'PLAYER' ? "YOUR TURN" : "ENEMY TURN"}</span>
        </div>

        {/* 내 필드 */}
        <div className="field-row player-field">
            {playerField.map(unit => renderUnit(unit))}
            {playerField.length === 0 && <div className="empty-field-msg">유닛을 소환하세요</div>}
        </div>
      </div>

      {/* 중앙 정보 & 로그 */}
      <div className="game-controls">
         <div className="logs-container">
            {log.slice(-2).map((msg, i) => <div key={i} className="log-item">{msg}</div>)}
         </div>
         <button 
            className="end-turn-btn"
            onClick={actions.endTurn} 
            disabled={turn !== 'PLAYER'}
         >
            턴 종료
         </button>
      </div>

      {/* 플레이어 핸드 영역 */}
      <div className="area player-area">
        <div className="status-bar">Player HP: {player.hp} / Mana: {player.mana}</div>
        <div className="hand">
          {hand.map((card, index) => (
            <div 
              key={index} 
              className="card" 
              onClick={() => actions.playCard(index)}
            >
              <div className="card-cost">{card.cost}</div>
              <div className="card-name">{card.name}</div>
              <div className="card-desc">{card.description}</div>
              {/* 유닛인 경우 공격력/체력 표시 */}
              {'attack' in card && (
                  <div className="card-stats">
                      ⚔️ {(card as any).attack} / 🛡️ {(card as any).hp}
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};