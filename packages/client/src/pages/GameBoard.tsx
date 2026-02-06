import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/GameBoard.css";
import "../css/Card.css";
import "../css/GameModal.css";
import "../css/GameEffects.css";
import { useGameInteraction } from "../hooks/useGameInteraction";
import { useGameInitialization } from "../hooks/useGameInitialization";
import { useGameDragDrop } from "../hooks/useGameDragDrop";
import { usePlayerDamageAnimation } from "../hooks/usePlayerDamageAnimation";
import { GameStatus } from "@card-game/shared";
import { useTargetingArrow } from "../hooks/useTargetingArrow";
import { useGameEffects } from "../hooks/useGameEffects";
import { useAttackEffects } from "../hooks/useAttackEffects";
import { useSpellCastEffect } from "../hooks/useSpellCastEffect";
import { useGameState } from "../hooks/GameContext";
import { 
  EnemyArea, 
  ExhaustPileModal, 
  GameResultModal, 
  PlayerArea, 
  PlayerField, 
  RoundVictoryModal, 
  Shop, 
  SpellCastAnimation, 
  TargetingArrow, 
  Toast
} from "../components";

export const GameBoard = () => {
  const { 
    gameState, 
    isConnected, 
    mergeFieldUnits,
    playCard, 
    endTurn, 
    attack, 
    startGame, 
    enterShop,
    resetGame, 
    error, 
    clearError,
  } = useGameState();

  const location = useLocation();
  const navigate = useNavigate();
  const deck = location.state?.deck || [];
  const [showExhaustPile, setShowExhaustPile] = useState(false);

  const { 
    selectedAttackerId, 
    handlePlayerUnitClick, 
    handleEnemyClick, 
    cancelInteraction,
    error: interactionError,
    clearError: clearInteractionError
  } = useGameInteraction(
    gameState?.gameStatus === GameStatus.PLAYER_TURN || false,
    attack
  );
  
  const {
    draggedCard,
    isDragging,
    setDraggedCard,
    handleDragOver,
    handleDrop,
    handleUnitDragStart,
    handleUnitDrop,
    handleCardDragStart
  } = useGameDragDrop(playCard, mergeFieldUnits);

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
    showTurnNotification
  } = useGameEffects(gameState);

  useAttackEffects(gameState, getUnitCenter, getUnitElement);

  const spellEffect = useSpellCastEffect();

  // 연결 중이거나 게임 상태가 없을 때 처리
  if (!isConnected || !gameState) {
    // 초기화 단계에서 에러가 발생한 경우 (예: 연결 실패)
    if (error) {
      return (
        <div className="error-screen">
          <h2>게임 연결 오류</h2>
          <p>{error.message}</p>
          <button className="return-main-btn" onClick={() => navigate('/')}>
            메인 메뉴로 돌아가기
          </button>
        </div>
      );
    }

    // 정상적인 로딩 상태
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>{!isConnected ? "서버에 연결 중입니다..." : "전장을 준비하는 중..."}</h2>
      </div>
    );
  }
 
  const { isPlayerTurn } = gameState.gameStatus === GameStatus.PLAYER_TURN 
    ? { isPlayerTurn: true } 
    : { isPlayerTurn: false };

  return (
    <div 
      className="game-board" 
      onClick={cancelInteraction} 
      onMouseMove={handleMouseMove}
    >
      {/* 최상단 상태 바 */}
      <div className="status-bar">
        <span style={{ marginRight: "15px", color: "#f1c40f", fontWeight: "bold" }}>
          ROUND {gameState.round}
        </span>
        <span>TURN {gameState.turn} — {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}</span>
      </div>

      {/* 적 영역 */}
      <EnemyArea 
        enemyField={gameState.enemyField}
        onEnemyClick={handleEnemyClick}
        setUnitRef={setUnitRef}
      />

      {/* 묘지 */}
      <div className="exhaust-pile-container">
        <button 
          onClick={() => setShowExhaustPile(true)}
          className="exhaust-pile-btn"
        >
          💀 묘지 ({gameState.exhaustPile.length})
        </button>
      </div>

      {/* 플레이어 필드 */}
      <PlayerField 
        playerField={gameState.playerField}
        selectedAttackerId={selectedAttackerId}
        setUnitRef={setUnitRef}
        onUnitClick={(unit, x, y) => {
          setMousePos({ x, y });
          handlePlayerUnitClick(unit);
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        isDragging={isDragging}
        draggedCard={draggedCard}
        onUnitDrop={handleUnitDrop}
        onUnitDragStart={handleUnitDragStart}
      />

      {/* 플레이어 영역 */}
      <PlayerArea 
        gameState={gameState}
        isPlayerTurn={isPlayerTurn}
        playerDamage={playerDamage}
        setUnitRef={setUnitRef}
        onEndTurn={endTurn}
        onPlayCard={playCard}
        onCardDragStart={handleCardDragStart}
        onCardDragEnd={() => setDraggedCard(null)}
      />

      {/* 에러 메시지 토스트 */}
      {(error || interactionError) && (
        <Toast 
          error={(error || interactionError)!} 
          onClose={() => {
            if (error) clearError();
            if (interactionError) clearInteractionError();
          }} 
        />
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
      
      {/* 스펠 사용 이펙트 */}
      {spellEffect && (
        <SpellCastAnimation 
          key={spellEffect.key} 
          cardId={spellEffect.cardId} 
        />
      )}

      {/* 라운드 승리 메시지 */}
      {gameState.gameStatus === GameStatus.ROUND_VICTORY && (
        <RoundVictoryModal onConfirm={enterShop} />
      )}

      {/* 상점 화면 (오버레이) */}
      {gameState.gameStatus === GameStatus.SHOP && <Shop />}

      {/* 게임 종료 모달 */}
      {(gameState.gameStatus === GameStatus.VICTORY || gameState.gameStatus === GameStatus.DEFEAT) && (
        <GameResultModal 
          status={gameState.gameStatus} 
          onReset={resetGame} 
        />
      )}

      {/* 소멸 카드 목록 모달 */}
      {showExhaustPile && (
        <ExhaustPileModal 
          cards={gameState.exhaustPile} 
          onClose={() => setShowExhaustPile(false)} 
        />
      )}
    </div>
  );
};