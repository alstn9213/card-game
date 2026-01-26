import { CardType, EffectType, TargetType } from "./types";

// 플레이어의 상태
export interface Entity {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
}

// 카드 데이터 구조
export interface CardData {
  cardId: string; // 예: "unit_slime" (데이터 ID)
  name: string;
  cost: number;
  description: string;
  type: CardType;
  targetType: TargetType;
}

// [인스턴스] 게임 내에 존재하는 카드 (덱, 핸드, 무덤)
export interface GameCard extends CardData {
  id: string;  // 예: "uuid-v4-..." (이 카드의 고유 번호)
  ownerId: string;     // 누구 소유인지
  
}

// 몬스터 카드
export interface UnitCard extends CardData {
  attackPower: number;
  maxHp: number;
  abilities?: Ability[];
}


// [필드 유닛] 전장에 소환된 상태
export interface FieldUnit extends GameCard {
  currentHp: number;
  hasAttacked: boolean;
  
}

export interface Ability {
  type: EffectType;
  value?: number;          // 데미지나 회복량 등 수치 (선택)
  targetId?: string;       // 변신할 대상의 ID 등 (선택)
}

