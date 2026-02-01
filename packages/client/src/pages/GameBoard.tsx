import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css/GameBoard.css";
import "../css/Card.css";
import "../css/GameModal.css";
import "../css/GameEffects.css";
import { useGameInteraction } from "../hooks/useGameInteraction";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { usePlayerDamageAnimation } from "../hooks/usePlayerDamageAnimation";
import { GameStatus } from "@card-game/shared";
import { Shop } from "./Shop";
import { GameResultModal } from "../components/GameResultModal";
import { Toast } from "../components/Toast";
import { TargetingArrow } from "../components/TargetingArrow";
import { useTargetingArrow } from "../hooks/useTargetingArrow";
import { useGameEffects } from "../hooks/useGameEffects";
import { RoundVictoryModal } from "../components/RoundVictoryModal";
import { EnemyArea } from "../components/EnemyArea";
import { BattleZone } from "../components/BattleZone";
import { PlayerArea } from "../components/PlayerArea";
import { useGameState } from "../hooks/GameContext";

export const GameBoard = () => {
  const { 
    gameState, 
    isConnected, 
    playCard, 
    endTurn, 
    attack, 
    startGame, 
    resetGame, 
    error, 
    clearError 
  } = useGameState();

  const location = useLocation();
  const deck = location.state?.deck || [];
  
  const { 
    selectedAttackerId, 
    handlePlayerUnitClick, 
    handleEnemyClick, 
    cancelInteraction 
  } = useGameInteraction(
    gameState?.isPlayerTurn ?? false,
    attack
  );
  
  useGameInitialization(isConnected, startGame);
  useEffect(() => {
    if (isConnected) {
      startGame(deck);
    }
  }, [isConnected, startGame]);
  
  const playerDamage = usePlayerDamageAnimation(gameState);

  const { 
    mousePos, 
    setMousePos, 
    handleMouseMove, 
    getUnitCenter, 
    setUnitRef, 
    getUnitElement 
  } = useTargetingArrow(!!selectedAttackerId);

  const { 
    showRoundVictory, 
    showTurnNotification, 
    handleVictoryConfirm 
  } = useGameEffects(gameState, getUnitCenter, getUnitElement);

  if (!isConnected) {
    return <div className="loading">서버에 연결 중입니다...</div>;
  }

  if (!gameState) {
    return (
      <div className="loading">게임 준비 중...</div>
    );
  }
 
  const { isPlayerTurn } = gameState;

  return (
    // 배경 클릭 시 상호작용 취소
    <div className="game-board" onClick={cancelInteraction} onMouseMove={handleMouseMove}>
      {/* 최상단 상태 바 */}
      <div className="status-bar">
        <span style={{ marginRight: "15px", color: "#f1c40f", fontWeight: "bold" }}>
          ROUND {gameState.round}
        </span>
        <span>TURN {gameState.turn} — {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}</span>
      </div>

      {/* 1. 적 영역 */}
      <EnemyArea 
        enemyField={gameState.enemyField}
        onEnemyClick={handleEnemyClick}
        setUnitRef={setUnitRef}
      />

      {/* 2. 중앙 전장 (플레이어 필드) */}
      <BattleZone 
        playerField={gameState.playerField}
        selectedAttackerId={selectedAttackerId}
        setUnitRef={setUnitRef}
        onUnitClick={(unit, x, y) => {
          setMousePos({ x, y });
          handlePlayerUnitClick(unit);
        }}
      />

      {/* 3. 플레이어 영역 */}
      <PlayerArea 
        gameState={gameState}
        isPlayerTurn={isPlayerTurn}
        playerDamage={playerDamage}
        setUnitRef={setUnitRef}
        onEndTurn={endTurn}
        onPlayCard={playCard}
      />

      {/* 에러 메시지 토스트 */}
      {error && (
        <Toast error={error} onClose={clearError} />
      )}

      {/* 공격 대상 지정 화살표 */}
      {selectedAttackerId && (() => {
        const start = getUnitCenter(selectedAttackerId);
        return start ? <TargetingArrow start={start} end={mousePos} /> : null;
      })()}

      {/* 턴 시작 알림 */}
      {showTurnNotification && (
        <div className="turn-notification">YOUR TURN</div>
      )}

      {/* 라운드 승리 메시지 */}
      {showRoundVictory && (
        <RoundVictoryModal onConfirm={handleVictoryConfirm} />
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