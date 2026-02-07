import "../../css/Shop.css";
import "../../css/Card.css";
import { useGameState } from '../../hooks/GameContext';
import { Card } from "../Card";

export const Shop = () => {
  const { gameState, buyCard, continueRound } = useGameState();

  if (!gameState) {
    console.warn("[Shop] gameState가 없습니다.");
    return null;
  }
  
  return (
    <div className="shop-overlay">
      <div className="shop-container">
        <h2 className="shop-title">🏕️ 상점</h2>
        
        <div className="shop-stats">
          <div className="shop-stat-item">
            <span className="shop-icon">💰</span>
            <span>{gameState.currentGold} G</span>
          </div>
          <div className="shop-stat-item">
            <span className="shop-icon">❤️</span>
            <span>{gameState.player.currentHp} / {gameState.player.maxHp}</span>
          </div>
        </div>

        <div className="shop-message">
          <p>전투를 마치고 잠시 숨을 고릅니다.</p>
        </div>

        {gameState.shopItems.length > 0 && (
          <div className="shop-list">
            <h3 className="shop-section-title">🛒 전리품 상점</h3>
            <div className="shop-card-grid">
              {gameState.shopItems.map((card, index) => {

                return (
                <div key={index} className="shop-card-item">
                  <Card 
                    card={card} 
                    variant="hand"
                  />
                  <button 
                    onClick={() => buyCard(index)}
                    className="shop-buy-btn"
                    disabled={gameState.currentGold < card.cost}
                  >
                    구매
                  </button>
                </div>
              )})}
            </div>
          </div>
        )}

        <button 
          onClick={continueRound} 
          className="shop-next-btn"
        >
          다음 라운드 진행 ⚔️
        </button>
      </div>
    </div>
  );
};