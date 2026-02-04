import { DeckRules, UNIT_CARDS, SPELL_CARDS, validateDeck, type CardData, createError, ErrorCode, type GameError } from '@card-game/shared';
import { useState,  useMemo } from 'react';

// 정적 데이터이므로 훅 외부에서 한 번만 정의하는 것이 효율적이다.
const ALL_CARDS = [...UNIT_CARDS, ...SPELL_CARDS];

export const useDeckBuilder = () => {
  const [deck, setDeck] = useState<string[]>([]);
  const [toastError, setToastError] = useState<GameError | null>(null);

  // 덱에 포함된 특정 카드의 개수 계산
  const getCardCount = (cardId: string) => deck.filter((id) => id === cardId).length;

  // 덱 추가 로직
  const addToDeck = (card: CardData) => {
    if (deck.length >= DeckRules.MAX_DECK_SIZE) {
      setToastError(createError(ErrorCode.MAX_DECK_SIZE));
      return;
    }
    if (getCardCount(card.cardId) >= DeckRules.MAX_COPIES_PER_CARD) {
      setToastError(createError(ErrorCode.MAX_COPIES_PER_CARD));
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
      const card = ALL_CARDS.find(c => c.cardId === id);
      if (card) {
        groups.push({ card, count: getCardCount(id) });
      }
    });
    
    // 코스트 순 정렬
    return groups.sort((a, b) => a.card.cost - b.card.cost);
  }, [deck]);

  return {
    deck,
    allCards: ALL_CARDS,    
    setDeck,
    addToDeck,
    removeFromDeck,
    validation,
    groupedDeck,
    getCardCount,
    toastError,
    setToastError
    };
};