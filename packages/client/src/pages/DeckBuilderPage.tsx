import { DeckRules } from "@card-game/shared";
import { useDeckBuilder } from "../hooks/useDeckBuilder";
import "../css/DeckBuilder.css";
import { Toast } from "../components/Toast";
import { Card } from "../components/Card";


interface DeckBuilderPageProps {
  onGameStart: (deckCardIds: string[]) => void;
  onBack: () => void;
}

export const DeckBuilderPage = ({ onGameStart, onBack }: DeckBuilderPageProps) => {
  const { deck, allCards, getCardCount, addToDeck, removeFromDeck, groupedDeck, validation, toastError, setToastError } = useDeckBuilder();
  return (
    <div className="deck-builder-container">
      {toastError && <Toast error={toastError} onClose={() => setToastError(null)} />}

      {/* 왼쪽: 카드 라이브러리 */}
      <div className="library-section">
        <div className="section-header">
          <h2>카드 보관함</h2>
          <button className="back-btn" onClick={onBack}>뒤로가기</button>
        </div>
        <div className="card-grid">
          {allCards.map((card) => {
            const count = getCardCount(card.cardId);
            const isMaxed = count >= DeckRules.MAX_COPIES_PER_CARD;
            
            return (
              <Card
                key={card.cardId} 
                card={card}
                variant="hand"
                className={`library-card ${isMaxed ? "disabled" : ""}`}
                onClick={() => addToDeck(card)}
              >
                <div className="card-desc">{card.description}</div>
                <div className="card-count-badge">{count}/{DeckRules.MAX_COPIES_PER_CARD}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 오른쪽: 현재 덱 구성 */}
      <div className="deck-sidebar">
        <div className="deck-header">
          <h2>나의 덱</h2>
          <div className={`deck-count ${validation.isValid ? "valid" : "invalid"}`} title={validation.message}>
            {deck.length} / {DeckRules.MAX_DECK_SIZE}
          </div>
        </div>

        <div className="deck-list">
          {groupedDeck.length === 0 && (
            <div className="empty-message">카드를 선택하여 덱을 구성하세요.</div>
          )}
          {groupedDeck.map(({ card, count }) => (
            <div 
              key={card.cardId} 
              className="deck-list-item"
              onClick={() => removeFromDeck(card.cardId)}
              onContextMenu={(e) => {
                e.preventDefault();
                removeFromDeck(card.cardId);
              }}
              title="클릭하여 제거"
            >
              <div className="item-cost">{card.cost}</div>
              <div className="item-name">{card.name}</div>
              <div className="item-count">x{count}</div>
            </div>
          ))}
        </div>

        <div className="deck-footer">
          <button 
            className="start-game-btn" 
            disabled={!validation.isValid}
            onClick={() => onGameStart(deck)}
            title={validation.message}
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
};