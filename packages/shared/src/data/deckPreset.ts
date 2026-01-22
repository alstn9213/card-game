import { CARD_CATALOG } from "./cardCatalog";
import { Card, Deck } from "../interfaces";

// ID를 가지고 실제 카드 객체를 찾아주는 헬퍼 함수
const findCard = (id: string): Card => {
  const card = CARD_CATALOG.find(c => c.id === id);
  if (!card) throw new Error(`Card with id ${id} not found!`);
  // 실제 게임에서는 객체를 복사해서 반환해야 안전합니다 (메모리 참조 문제 방지)
  return { ...card };
};

export const createStarterDeck = (): Deck => {
  const deckCards: Card[] = [
    findCard("breath of fire"), findCard("breath of fire"), findCard("breath of fire"), 
    findCard("recovery"), findCard("recovery"), findCard("recovery"),
    findCard("baby_dragon"), findCard("baby_dragon"), findCard("baby_dragon"),
    findCard("red_dragon"),
  ];

  return {
    id: "deck_starter_01",
    userId: "user_guest",
    name: "초심자 덱",
    cards: deckCards
  };
};

