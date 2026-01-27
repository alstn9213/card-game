import "../css/GameBoard.css";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import { useGameInteraction } from "../hooks/useGameInteraction";
import { UnitSlot } from "../components/UnitSlot";
import { type GameError, type GameState, GameStatus } from "@card-game/shared";

interface UseGameStateResult {
  gameState: GameState | null;
  isConnected: boolean;
  playCard: (cardIndex: number) => void;
  endTurn: () => void;
  attack: (attackerId: string, targetId: string) => void;
  startGame?: (deck: string[]) => void;
  activateAbility: (cardInstanceId: string, abilityIndex: number, targetId?: string) => void;
  resetGame: () => void;
  error: GameError | null;
  clearError: () => void;
}

export const GameBoard = () => {
  const location = useLocation();
  const { gameState, isConnected, playCard, endTurn, attack, startGame, activateAbility, resetGame, error, clearError } = useGameState() as UseGameStateResult;
  
  const { selectedAttackerId, pendingAbility, handlePlayerUnitClick, handleEnemyClick, handleAbilityClick, cancelInteraction } = useGameInteraction(
    gameState?.isPlayerTurn ?? false,
    attack,
    activateAbility
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
    // 배경 클릭 시 상호작용 취소
    <div className="game-board" onClick={cancelInteraction}>
      {/* 최상단 상태 바 */}
      <div className="status-bar">
        <span style={{ marginRight: "15px", color: "#f1c40f", fontWeight: "bold" }}>
          ROUND {gameState.round}
        </span>
        <span>TURN {gameState.turn} — {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}</span>
        {pendingAbility && (
          <span style={{ marginLeft: "20px", color: "#3498db", fontWeight: "bold" }}>🎯 대상을 선택하세요</span>
        )}
      </div>

      {/* 1. 적 영역 */}
      <div className="enemy-area" onClick={(e) => {
        e.stopPropagation();
        handleEnemyClick("enemy");
      }}>
        
        
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
              onClick={(e) => {
                e.stopPropagation();
                if (unit) handlePlayerUnitClick(unit);
              }}
              onActivateAbility={(idx) => {
                if (unit && unit.abilities) {
                  handleAbilityClick(unit.id, idx, unit.abilities[idx]);
                }
              }}
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
             onClick={(e) => {
               e.stopPropagation();
               endTurn();
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
                key={index} 
                className="card" 
                onClick={(e) => {
                  e.stopPropagation();
                  playCard(index);
                }}
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
            <div className="modal-message">{error.message}</div>
            <button className="modal-btn" onClick={clearError}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 게임 종료 모달 */}
      {(gameState.gameStatus === GameStatus.VICTORY || gameState.gameStatus === GameStatus.DEFEAT) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className={`modal-title ${gameState.gameStatus}`}>
              {gameState.gameStatus === GameStatus.VICTORY ? "VICTORY!" : "DEFEAT"}
            </div>
            <div className="modal-message">
              {gameState.gameStatus === GameStatus.VICTORY 
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