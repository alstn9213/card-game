import { useGameState } from '../hooks/useGameState';
import { useShopActions } from '../hooks/useShopActions';
import "../css/Shop.css";
import { DeckRules } from "@card-game/shared";

export const Shop = () => {
  const { gameState, socket } = useGameState();
  const { buyCard, continueRound } = useShopActions(socket);

  if (!gameState) return null;

  const getDeckCount = (cardId: string) => {
    return gameState.deck.filter((c) => c.cardId === cardId).length;
  };

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
          <p className="shop-sub-message">체력이 소량 회복되었습니다.</p>
        </div>

        {gameState.shopItems.length > 0 && (
          <div className="shop-list">
            <h3 className="shop-section-title">🛒 전리품 상점</h3>
            <div className="shop-card-grid">
              {gameState.shopItems.map((card, index) => {
                const currentCount = getDeckCount(card.cardId);
                const isMaxCopies = currentCount >= DeckRules.MAX_COPIES_PER_CARD;

                return (
                <div key={index} className={`shop-card-item ${isMaxCopies ? 'sold-out' : ''}`}>
                  <div className="shop-card-name">{card.name}</div>
                  <div className="shop-card-cost">🪙 {card.cost}</div>
                  <button 
                    onClick={() => buyCard(index)}
                    className="shop-buy-btn"
                    disabled={gameState.currentGold < card.cost || isMaxCopies}
                  >
                    {isMaxCopies ? "한도 초과" : "구매"}
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