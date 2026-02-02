import type { UnitCard } from "../interfaces";
import { CardType, TargetType } from "../types";

export const UNIT_CARDS: UnitCard[] = [
  {
    cardId: "tank",
    name: "시즈 탱크",
    description: "강력한 탱크",
    cost: 3,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 30,
    maxHp: 50,
  },
  {
    cardId: "val",
    name: "발키리",
    description: "공중 유닛",
    cost: 3,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 25,
    maxHp: 40,
  },
   {
    cardId: "marine",
    name: "마린",
    description: "총을 쓰는 보병",
    cost: 1,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 10,
    maxHp: 15,
  },
  {
    cardId: "ghost",
    name: "고스트",
    description: "특수 보병",
    cost: 2,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 15,
    maxHp: 20,
  },
   {
    cardId: "goli",
    name: "골리앗",
    description: "군인이 탑승한 로봇",
    cost: 3,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 20,
    maxHp: 30,
  },
  {
    cardId: "battle_cruiser",
    name: "배틀크루저",
    description: "최강 유닛",
    cost: 5,
    type: CardType.UNIT,
    targetType: TargetType.SINGLE_ENEMY,
    attackPower: 50,
    maxHp: 70,
  },
  
  
];