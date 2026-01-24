// packages/shared/src/data/spells.ts
import { CardType, TargetType } from "../types";
import type { SpellCard } from "../interfaces";

export const SPELL_CARDS: SpellCard[] = [
  {
    id: "breath of fire",
    name: "불뿜기",
    description: "적 하나에게 500의 피해를 줍니다.",
    cost: 1,
    type: CardType.SPELL,
    targetType: TargetType.SINGLE_ENEMY,
    value: 500
  },
  {
    id: "recovery",
    name: "회복",
    description: "체력을 500 회복합니다.",
    cost: 1,
    type: CardType.SPELL,
    targetType: TargetType.SELF,
    value: 500
  }
];