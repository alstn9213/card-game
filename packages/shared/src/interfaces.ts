import { CardType, EffectType, TargetType } from "./types";

// 적이나 플레이어의 상태
export interface Entity {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  attackPower?: number;
  cost?: number;
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
  abilities?: Ability[];
}

// 능력 구조체 정의
export interface Ability {
  type: EffectType;
  cost?: number;           // 능력 사용 코스트 (선택)
  value?: number;          // 데미지나 회복량 등 수치 (선택)
  targetId?: string;       // 변신할 대상의 ID 등 (선택)
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
  hasAttacked: boolean;
}
