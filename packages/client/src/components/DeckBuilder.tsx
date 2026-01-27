import { useState, useMemo } from "react";
import { UNIT_CARDS, DeckRules, type CardData } from "@card-game/shared";
import { validateDeck } from "@card-game/shared/src/utils/deckValidator";
import "./DeckBuilder.css";

interface DeckBuilderProps {
  onGameStart: (deckCardIds: string[]) => void;
  onBack: () => void;
}

export const DeckBuilder = ({ onGameStart, onBack }: DeckBuilderProps) => {
  // 선택된 카드의 ID 목록 (중복 허용)
  const [deck, setDeck] = useState<string[]>([]);

  // 전체 카드 목록 (배열로 변환)
  const allCards = useMemo(() => Object.values(UNIT_CARDS), []);

  // 덱에 포함된 특정 카드의 개수 계산
  const getCardCount = (cardId: string) => deck.filter((id) => id === cardId).length;

  // 덱 추가 로직
  const addToDeck = (card: CardData) => {
    if (deck.length >= DeckRules.MIN_DECK_SIZE) {
      alert(`덱은 최대 ${DeckRules.MIN_DECK_SIZE}장까지만 구성할 수 있습니다.`);
      return;
    }
    if (getCardCount(card.cardId) >= DeckRules.MAX_COPIES_PER_CARD) {
      alert(`같은 카드는 최대 ${DeckRules.MAX_COPIES_PER_CARD}장까지만 넣을 수 있습니다.`);
      return;
    }
    setDeck([...deck, card.cardId]);
  };

  // 덱에서 카드 제거 로직
  const removeFromDeck = (cardId: string) => {
    const index = deck.indexOf(cardId);
    if (index > -1) {
      const newDeck = [...deck];
      newDeck.splice(index, 1);
      setDeck(newDeck);
    }
  };

  // 덱 유효성 검사
  const validation = useMemo(() => validateDeck(deck), [deck]);

  // 덱 리스트를 보기 좋게 그룹화 (UI 표시용)
  const groupedDeck = useMemo(() => {
    const groups: { card: CardData; count: number }[] = [];
    const uniqueIds = Array.from(new Set(deck));
    
    uniqueIds.forEach(id => {
      const card = allCards.find(c => c.cardId === id);
      if (card) {
        groups.push({ card, count: getCardCount(id) });
      }
    });
    
    // 코스트 순 정렬
    return groups.sort((a, b) => a.card.cost - b.card.cost);
  }, [deck, allCards]);

  return (
    <div className="deck-builder-container">
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
              <div 
                key={card.cardId} 
                className={`library-card ${isMaxed ? "disabled" : ""}`}
                onClick={() => addToDeck(card)}
              >
                <div className="card-cost-badge">{card.cost}</div>
                <div className="card-name">{card.name}</div>
                <div className="card-desc">{card.description}</div>
                <div className="card-count-badge">{count}/{DeckRules.MAX_COPIES_PER_CARD}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오른쪽: 현재 덱 구성 */}
      <div className="deck-sidebar">
        <div className="deck-header">
          <h2>나의 덱</h2>
          <div className={`deck-count ${validation.isValid ? "valid" : "invalid"}`} title={validation.message}>
            {deck.length} / {DeckRules.MIN_DECK_SIZE}
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