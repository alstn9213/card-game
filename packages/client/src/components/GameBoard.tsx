import './GameBoard.css'; 
import { useGameState } from '../hooks/useGameState';

export const GameBoard = () => {
  const { gameState, isConnected, playCard, endTurn } = useGameState();

  if (!isConnected) {
    return <div className="loading">서버에 연결 중입니다...</div>;
  }

  if (!gameState) {
    return <div className="loading">로딩중...</div>;
  }

  const { player, enemy, hand, currentGold, isPlayerTurn, gameStatus } = gameState;

  return (
    <div className="game-board">
      <div className="status-bar">
        Turn: {gameState.turn} | {isPlayerTurn ? "Your Turn" : "Enemy Turn"}
      </div>

      {/* 적 영역 */}
      <div className="enemy-area">
        <div className="unit enemy">
          <div className="name">{enemy.name}</div>
          <div className="hp-bar">
            HP: {enemy.currentHp} / {enemy.maxHp} 
          </div>
        </div>
      </div>

      {/* 게임 결과 오버레이 */}
      {gameStatus !== 'playing' && (
        <div className={`game-result ${gameStatus}`}>
          {gameStatus === 'victory' ? 'VICTORY!' : 'DEFEAT'}
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}

      {/* 플레이어 영역 */}
      <div className="player-area">
        <div className="unit player">
          <div className="name">{player.name}</div>
          <div className="stats">
            HP: {player.currentHp} / {player.maxHp} 
            <br />
            Gold: {currentGold}
          </div>
        </div>

        <div className="hand">
          {hand.map((card, index) => (
            <div 
              key={card.id + index} // 고유 키 생성
              className={`card ${currentGold < card.cost ? 'disabled' : ''}`}
              onClick={() => playCard(index)}
            >
              <div className="card-name">{card.name}</div>
              <div className="card-cost">{card.cost}</div>
              <div className="card-desc">{card.description}</div>
            </div>
          ))}
        </div>

        <button 
          className="end-turn-btn"
          onClick={endTurn}
          disabled={!isPlayerTurn || gameStatus !== 'playing'}
        >
          End Turn
        </button>
      </div>
    </div>
  );
};