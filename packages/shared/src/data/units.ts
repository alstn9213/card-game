// packages/shared/src/data/units.ts
import { UnitCard } from "../interfaces";
import { CardType, TargetType } from "../enums";

export const UNIT_CARDS: UnitCard[] = [
  {
    id: "baby_dragon",
    name: "아기 용",
    description: "약한 용입니다.",
    cost: 1,
    type: CardType.UNIT,
    target: TargetType.SINGLE_ENEMY,
    attackPower: 200,
    health: 800
  },
  {
    id: "red_dragon",
    name: "붉은 용",
    description: "아기용 성장시 소환합니다.",
    cost: 2,
    type: CardType.UNIT,
    target: TargetType.ALL_ENEMIES,
    attackPower: 1000,
    health: 2000
  }
];