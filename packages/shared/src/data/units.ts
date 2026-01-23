import { CardType, TargetType } from "../enums";
import { UnitCard } from "../interfaces";

export const UNIT_CARDS: UnitCard[] = [
  {
    id: "baby_dragon",
    name: "아기 용",
    description: "약한 용입니다.",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 300,
    hp: 800
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
  }
];