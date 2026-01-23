import { CardType, TargetType } from "./enums";

// 적이나 플레이어의 상태
export interface Entity {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
}

// 카드 데이터 구조
export interface Card {
  id: string;
  name: string;
  cost: number;
  description: string;
  type: CardType;
  targetType: TargetType;
}

export interface UnitCard extends Card {
  attackPower: number;
  hp: number;
}

export interface SpellCard extends Card {
  value: number;
}
