import "../css/GameBoard.css";
import "../css/Card.css";
import "../css/GameModal.css";
import "../css/GameEffects.css";
import { useGameState } from "../hooks/useGameState";
import { useGameInteraction } from "../hooks/useGameInteraction";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { usePlayerDamageAnimation } from "../hooks/usePlayerDamageAnimation";
import { UnitSlot } from "../components/UnitSlot";
import { GameStatus, type FieldUnit } from "@card-game/shared";
import { Shop } from "./Shop";
import { GameResultModal } from "../components/GameResultModal";
import { ErrorModal } from "../components/ErrorModal";
import { TargetingArrow } from "../components/TargetingArrow";
import { useTargetingArrow } from "../hooks/useTargetingArrow";
import { useGameEffects } from "../hooks/useGameEffects";
import { RoundVictoryModal } from "../components/RoundVictoryModal";

export const GameBoard = () => {
  const { gameState, isConnected, playCard, endTurn, attack, startGame, activateAbility, resetGame, error, clearError } = useGameState();
  
  const { selectedAttackerId, pendingAbility, handlePlayerUnitClick, handleEnemyClick, handleAbilityClick, cancelInteraction } = useGameInteraction(
    gameState?.isPlayerTurn ?? false,
    attack,
    activateAbility
  );

  useGameInitialization(isConnected, startGame);
  
  const playerDamage = usePlayerDamageAnimation(gameState);
  const { mousePos, setMousePos, handleMouseMove, getUnitCenter, setUnitRef, getUnitElement } = useTargetingArrow(!!selectedAttackerId);
  const { showRoundVictory, showTurnNotification, enemyAttackArrow } = useGameEffects(gameState, getUnitCenter, getUnitElement);

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
    <div className="game-board" onClick={cancelInteraction} onMouseMove={handleMouseMove}>
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
                  ref={(el) => {
                    if (unit) setUnitRef(unit.id, el);
                  }}
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
              ref={(el) => {
                if (unit) setUnitRef(unit.id, el);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setMousePos({ x: e.clientX, y: e.clientY }); // 클릭 즉시 화살표 시작점 설정
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
      <div className="player-area" style={{ position: 'relative' }}>
        {/* 플레이어 상태 바 (아바타, 골드, 턴 종료) */}
        <div className="player-status-bar">
           <div className="avatar player-avatar" ref={(el) => setUnitRef("player", el)}>
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
                key={card.id} 
                className="card draw-effect" 
                onClick={(e) => {
                  e.stopPropagation();
                  playCard(index);
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

      {/* 에러 메시지 모달 */}
      {error && (
        <ErrorModal error={error} onClose={clearError} />
      )}

      {/* 공격 대상 지정 화살표 */}
      {selectedAttackerId && (() => {
        const start = getUnitCenter(selectedAttackerId);
        return start ? <TargetingArrow start={start} end={mousePos} /> : null;
      })()}

      {/* 적 공격 화살표 (자동) */}
      {enemyAttackArrow && (
        <TargetingArrow start={enemyAttackArrow.start} end={enemyAttackArrow.end} />
      )}

      {/* 턴 시작 알림 */}
      {showTurnNotification && (
        <div className="turn-notification">YOUR TURN</div>
      )}

      {/* 라운드 승리 메시지 */}
      {showRoundVictory && (
        <RoundVictoryModal />
      )}

      {/* 상점 화면 (오버레이) */}
      {gameState.gameStatus === GameStatus.SHOP && !showRoundVictory && <Shop />}

      {/* 게임 종료 모달 */}
      {(gameState.gameStatus === GameStatus.VICTORY || gameState.gameStatus === GameStatus.DEFEAT) && (
        <GameResultModal 
          status={gameState.gameStatus} 
          onReset={resetGame} 
        />
      )}
    </div>
  );
};