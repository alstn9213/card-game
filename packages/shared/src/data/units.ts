import type { UnitCard } from "../interfaces";
import { CardType, EffectType, TargetType } from "../types";

export const UNIT_CARDS: UnitCard[] = [
  {
    id: "baby_dragon",
    name: "아기 용",
    description: "붉은 용으로 성장할 수 있습니다.",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 300,
    hp: 800,
    abilities: [
      {
        type: EffectType.TRANSFORM,
        targetId: "red_dragon" // 변신할 대상 ID
      }
    ]
  },
  {
    id: "red_dragon",
    name: "붉은 용",
    description: "아기용 성장시 소환합니다.",
    cost: 2,
    type: CardType.UNIT,
    targetType: TargetType.ALL_ENEMIES,
    attackPower: 1000,
    hp: 2000
  },
  {
    id: "mecha_soldier",
    name: "기계 전사",
    description: "",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 500,
    hp: 1000,
  },
  
];