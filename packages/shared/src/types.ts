// 카드 종류
export const CardType = {
  UNIT: "UNIT",     // 유희왕의 몬스터 같은 소환수
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

// 타겟 방식 (누구를 때릴지)
export const TargetType = {
  SINGLE_ENEMY: "SINGLE_ENEMY", // 적 하나
  ALL_ENEMIES: "ALL_ENEMIES",   // 적 전체
  SELF: "SELF",                 // 나 자신 (힐, 버프)
  NONE: "NONE"                  // 타겟 필요 없음 (필드 마법 등)
} as const;
export type TargetType = (typeof TargetType)[keyof typeof TargetType];

// 효과의 종류.
export const EffectType = {
  TRANSFORM: "TRANSFORM", // 변신 (진화)
  DAMAGE: "DAMAGE",       // 데미지
  HEAL: "HEAL"            // 회복
} as const;
export type EffectType = (typeof EffectType)[keyof typeof EffectType];

