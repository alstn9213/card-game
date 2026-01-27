import { useState, useEffect, useRef } from "react";
import "./GameBoard.css"; 
import { useGameState } from "../hooks/useGameState";
import { useGameInteraction } from "../hooks/useGameInteraction";
import { UnitSlot } from "./UnitSlot";
import { DeckBuilder } from "./DeckBuilder";
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
}

export const GameBoard = () => {
  const { gameState, isConnected, playCard, endTurn, attack, startGame, activateAbility, resetGame } = useGameState() as UseGameStateResult;
  
  const { selectedAttackerId, handlePlayerUnitClick, handleEnemyClick } = useGameInteraction(
    gameState?.isPlayerTurn ?? false,
    attack
  );

  // 플레이어 본체 데미지 효과 상태
  const [playerDamage, setPlayerDamage] = useState<{ id: number; text: string } | null>(null);
  const prevPlayerHp = useRef<number | null>(null);

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
      <DeckBuilder 
        onGameStart={(deck) => {
          if (startGame) {
            startGame(deck);
          } else {
            console.error("startGame 함수가 useGameState에서 제공되지 않았습니다.");
          }
        }}
        onBack={() => console.log("뒤로가기")}
      />
    );
  }
 
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