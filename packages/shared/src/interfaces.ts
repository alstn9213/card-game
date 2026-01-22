import { CardType, TargetType } from './enums';

// 1. 모든 카드가 공통으로 가지는 속성
interface BaseCard {
  id: string;
  name: string;
  description: string;
  cost: number;
  imagePath?: string;
}

// 2. 유닛 카드 
export interface UnitCard extends BaseCard {
  type: CardType.UNIT;      
  attackPower: number;     
  health: number;     
  target: TargetType.SINGLE_ENEMY | TargetType.ALL_ENEMIES; 
}

// 3. 주문 카드 
export interface SpellCard extends BaseCard {
  type: CardType.SPELL  
  target: TargetType;       
  value?: number;           // 데미지나 힐량 (선택)
}

// 4. 이것들을 합쳐서 '카드'라고 부름
export type Card = UnitCard | SpellCard;

export interface Deck {
  id: string;
  userId: string;
  name: string;
  cards: Card[];
}