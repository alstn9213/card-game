// 카드 종류
export enum CardType {
  UNIT = 'UNIT',     // 유희왕의 몬스터 같은 소환수
  SPELL = 'SPELL',   // 슬더슬의 스킬이나 유희왕의 마법 카드
}

// 타겟 방식 (누구를 때릴지)
export enum TargetType {
  SINGLE_ENEMY = 'SINGLE_ENEMY', // 적 하나
  ALL_ENEMIES = 'ALL_ENEMIES',   // 적 전체
  SELF = 'SELF',                 // 나 자신 (힐, 버프)
  NONE = 'NONE'                  // 타겟 필요 없음 (필드 마법 등)
}
