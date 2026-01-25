import { CardType, EffectType, TargetType } from "./types";

// 플레이어의 상태
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
  maxHp: number;
  abilities?: Ability[];
}

export interface FieldUnit extends UnitCard {
  id: string;         // 고유 ID (uuid 등)
  cardId: string;     // 원본 카드 ID
  currentHp: number;
  hasAttacked: boolean;
}

export interface Ability {
  type: EffectType;
  value?: number;          // 데미지나 회복량 등 수치 (선택)
  targetId?: string;       // 변신할 대상의 ID 등 (선택)
}

