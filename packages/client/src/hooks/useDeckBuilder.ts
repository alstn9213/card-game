import { DeckRules, UNIT_CARDS, validateDeck, type CardData, DeckErrorMessages } from '@card-game/shared';
import { useState,  useMemo } from 'react';

export const useDeckBuilder = () => {
  // 선택된 카드의 ID 목록 (중복 허용)
  const [deck, setDeck] = useState<string[]>([]);

  // 전체 카드 목록 (배열로 변환)
  const allCards = useMemo(() => Object.values(UNIT_CARDS), []);

  // 덱에 포함된 특정 카드의 개수 계산
  const getCardCount = (cardId: string) => deck.filter((id) => id === cardId).length;

  // 덱 추가 로직
  const addToDeck = (card: CardData) => {
    if (deck.length >= DeckRules.MAX_DECK_SIZE) {
      alert(DeckErrorMessages.MAX_DECK_SIZE(DeckRules.MAX_DECK_SIZE));
      return;
    }
    if (getCardCount(card.cardId) >= DeckRules.MAX_COPIES_PER_CARD) {
      alert(DeckErrorMessages.MAX_COPIES_PER_CARD(card.name, DeckRules.MAX_COPIES_PER_CARD));
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
  const validation = useMemo(() => {
    try {
      validateDeck(deck);
      return { isValid: true, message: undefined };
    } catch (error: any) {
      return { isValid: false, message: error.message };
    }
  }, [deck]);

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

  return {
    deck,
    allCards,    
    setDeck,
    addToDeck,
    removeFromDeck,
    validation,
    groupedDeck,
    getCardCount, 
    };
};