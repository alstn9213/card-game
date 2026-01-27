import "../css/GameBoard.css";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import { useGameInteraction } from "../hooks/useGameInteraction";
import { UnitSlot } from "../components/UnitSlot";
import type { GameState } from "@card-game/shared";

interface UseGameStateResult {
  gameState: GameState | null;
  isConnected: boolean;
  playCard: (cardIndex: number) => void;
  endTurn: () => void;
  attack: (attackerId: string, targetId: string) => void;
  startGame?: (deck: string[]) => void;
  activateAbility: (cardInstanceId: string, abilityIndex: number) => void;
  resetGame: () => void;
  error: string | null;
  clearError: () => void;
}

export const GameBoard = () => {
  const location = useLocation();
  const { gameState, isConnected, playCard, endTurn, attack, startGame, activateAbility, resetGame, error, clearError } = useGameState() as UseGameStateResult;
  
  const { selectedAttackerId, handlePlayerUnitClick, handleEnemyClick } = useGameInteraction(
    gameState?.isPlayerTurn ?? false,
    attack
  );

  // 플레이어 본체 데미지 효과 상태
  const [playerDamage, setPlayerDamage] = useState<{ id: number; text: string } | null>(null);
  const prevPlayerHp = useRef<number | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isConnected && startGame && !hasStarted.current) {
      const deck = location.state?.deck || [];
      startGame(deck);
      hasStarted.current = true;
    }
  }, [isConnected, startGame, location.state]);

  useEffect(() => {
    if (gameState) {
      if (prevPlayerHp.current !== null && gameState.player.currentHp < prevPlayerHp.current) {
        const dmg = prevPlayerHp.current - gameState.player.currentHp;
        setPlayerDamage({ id: Date.now(), text: `-${dmg}` });
        setTimeout(() => setPlayerDamage(null), 1000);
      }
      prevPlayerHp.current = gameState.player.currentHp;
    }
  }, [gameState?.player.currentHp]);

  if (!isConnected) {
    return <div className="loading">서버에 연결 중입니다...</div>;
  }

  if (!gameState) {
    return (
      <div className="loading">게임 준비 중...</div>
    );
  }
 
  const { currentGold, isPlayerTurn } = gameState;

  return (
    <div className="game-board">
      {/* 최상단 상태 바 */}
      <div className="status-bar">
        <span style={{ marginRight: "15px", color: "#f1c40f", fontWeight: "bold" }}>
          ROUND {gameState.round}
        </span>
        <span>TURN {gameState.turn} — {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}</span>
      </div>

      {/* 1. 적 영역 */}
      <div className="enemy-area" onClick={() => handleEnemyClick("enemy")}>
        
        
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
              onActivateAbility={(idx) => unit && activateAbility(unit.id, idx)}
            />
          ))}
        </div>
      </div>

      {/* 3. 플레이어 영역 */}
      <div className="player-area">
        {/* 플레이어 상태 바 (아바타, 골드, 턴 종료) */}
        <div className="player-status-bar">
           <div className="avatar player-avatar">
              {playerDamage && <div key={playerDamage.id} className="floating-damage">{playerDamage.text}</div>}
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
                {card.type === "UNIT" && (
                   <div className="card-stats">
                      <div className="stat-badge" style={{background: "#e67e22"}}>
                        {(card as any).attackPower}
                      </div>
                      <div className="stat-badge" style={{background: "#e74c3c"}}>
                        {(card as any).hp}
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 에러 메시지 모달 */}
      {error && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title" style={{ color: "#e74c3c" }}>ERROR</div>
            <div className="modal-message">{error}</div>
            <button className="modal-btn" onClick={clearError}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 게임 종료 모달 */}
      {(gameState.gameStatus === "victory" || gameState.gameStatus === "defeat") && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className={`modal-title ${gameState.gameStatus}`}>
              {gameState.gameStatus === "victory" ? "VICTORY!" : "DEFEAT"}
            </div>
            <div className="modal-message">
              {gameState.gameStatus === "victory" 
                ? "축하합니다! 모든 적을 물리쳤습니다." 
                : "아쉽게도 패배했습니다. 다시 도전해보세요."}
            </div>
            <button className="modal-btn" onClick={resetGame}>
              메인으로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};