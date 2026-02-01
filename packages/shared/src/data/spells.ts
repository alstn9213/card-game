import { CardType, EffectType, TargetType } from '../types';
import { SpellCard } from '../interfaces';

export const SPELL_CARDS: SpellCard[] = [
  {
    cardId: "earn_3_gold",
    name: "골드 획득",
    description: "3 골드를 획득합니다.",
    type: CardType.SPELL,
    effectType: EffectType.GOLD,
    cost: 0,
    value: 3,
    targetType: TargetType.NONE
  },
  {
    cardId: "draw_1_card",
    name: "카드 뽑기",
    description: "덱에서 카드 1장을 뽑습니다",
    type: CardType.SPELL,
    effectType: EffectType.DRAW,
    cost: 2,
    targetType: TargetType.NONE
  }
  
]