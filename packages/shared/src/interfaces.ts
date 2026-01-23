import { CardType, TargetType } from './enums';

// 모든 카드가 공통으로 가지는 속성
interface BaseCard {
  id: string;
  name: string;
  description: string;
  cost: number;
  imagePath?: string;
}

// 유닛 카드 
export interface UnitCard extends BaseCard {
  type: typeof CardType.UNIT;      
  attackPower: number;     
  hp: number;     
  target: typeof TargetType.SINGLE_ENEMY | typeof TargetType.ALL_ENEMIES; 
}

// 주문 카드 
export interface SpellCard extends BaseCard {
  type: typeof CardType.SPELL  
  target: TargetType;       
  value?: number;           // 데미지나 힐량 (선택)
}

// 이것들을 합쳐서 '카드'라고 부름
export type Card = UnitCard | SpellCard;

export interface Deck {
  id: string;
  userId: string;
  name: string;
  cards: Card[];
}