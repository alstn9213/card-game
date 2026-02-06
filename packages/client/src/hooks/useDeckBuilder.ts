import { UNIT_CARDS, SPELL_CARDS, validateDeck, type CardData, type GameError } from '@card-game/shared';
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
    const nextDeck = [...deck, card.cardId];
    const errors = validateDeck(nextDeck, { ignoreMinSize: true });
    
    if (errors.length > 0) {
      setToastError(errors[0]);
    } else {
      setDeck(nextDeck);
    }
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
    const errors = validateDeck(deck);
    if (errors.length === 0) {
      return { isValid: true, message: undefined };
    }
    return { isValid: false, message: errors.map(e => e.message).join('\n') };
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