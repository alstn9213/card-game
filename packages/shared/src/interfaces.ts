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

// 카드는 '데이터'이고, 필드에 나오면 '전투 유닛'이 됩니다.
// 기존 Entity는 플레이어 본체(영웅)용으로 쓰고, 필드 유닛용을 따로 만듭니다.
export interface FieldUnit {
  id: string;         // 고유 ID (uuid 등)
  cardId: string;     // 원본 카드 ID
  name: string;
  attackPower: number;
  maxHp: number;
  currentHp: number;
  
}