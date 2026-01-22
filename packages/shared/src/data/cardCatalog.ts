import { Card } from "../interfaces";
import { UNIT_CARDS } from "./units";
import { SPELL_CARDS } from "./spells";

// 두 배열을 합쳐서(Spread Operator) 전체 도감을 만듦
export const CARD_CATALOG: Card[] = [
    ...UNIT_CARDS, 
    ...SPELL_CARDS
];

// ID로 카드 찾기 헬퍼 (그대로 사용 가능)
export const getCardById = (id: string): Card | undefined => {
    return CARD_CATALOG.find(c => c.id === id);
};