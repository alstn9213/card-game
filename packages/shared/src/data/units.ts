import type { UnitCard } from "../interfaces";
import { CardType, EffectType, TargetType } from "../types";

export const UNIT_CARDS: UnitCard[] = [
  {
    cardId: "baby_dragon",
    name: "아기 용",
    description: "작은 용입니다.",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 300,
    maxHp: 800,
    abilities: [
      {
        type: EffectType.TRANSFORM,
        targetId: "red_dragon", // 변신할 대상 ID
        description: "붉은 용으로 변신합니다."
      }
    ]
  },
  {
    cardId: "red_dragon",
    name: "붉은 용",
    description: "아기용 성장시 소환합니다.",
    cost: 2,
    type: CardType.UNIT,
    targetType: TargetType.ALL_ENEMIES,
    attackPower: 1000,
    maxHp: 2000
  },
  {
    cardId: "mecha_soldier",
    name: "기계 전사",
    description: "고철로 만든 전사",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 500,
    maxHp: 1000,
  },
  {
    cardId: "big_mecha_soldier",
    name: "기계 거인 전사",
    description: "많은 고철로 만든 거인",
    cost: 3,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 1500,
    maxHp: 2000,
  },
  {
    cardId: "tank",
    name: "시즈 탱크",
    description: "강력한 탱크",
    cost: 5,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 2000,
    maxHp: 3000,
  },
   {
    cardId: "marine",
    name: "마린",
    description: "총을 쓰는 보병",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 500,
    maxHp: 600,
  },
   {
    cardId: "goli",
    name: "골리앗",
    description: "군인이 탑승한 로봇",
    cost: 3,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 1500,
    maxHp: 3000,
  },
  
];