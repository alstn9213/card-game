
// 카드 종류
export const CardType = {
  UNIT: "UNIT",     // 유희왕의 몬스터 같은 소환수
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

// 타겟 방식 (누구를 때릴지)
export const TargetType = {
  SINGLE_ENEMY: "SINGLE_ENEMY", // 적 하나
  ALL_ENEMIES: "ALL_ENEMIES",   // 적 전체
  PLAYER_FIELD: "PLAYER_FIELD",
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

// 덱 구성 규칙
export const DeckRules = {
  MAX_COPIES_PER_CARD: 3, // 동일 카드 최대 매수
  MIN_DECK_SIZE: 20,      // 최소 덱 매수
  MAX_DECK_SIZE: 30       // 최대 덱 매수
} as const;
export type DeckRules = (typeof DeckRules)[keyof typeof DeckRules];

// 게임 상태
export const GameStatus = {
  PLAYING: "playing",
  VICTORY: "victory",
  DEFEAT: "defeat",
  SHOP: "shop"
} as const;
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

// 에러 코드
export const ErrorCode = {
  GAME_NOT_STARTED: "GAME_NOT_STARTED",
  ABILITY_USE_FAILED: "ABILITY_USE_FAILED",
  PLAY_CARD_FAILED: "PLAY_CARD_FAILED",
  ATTACK_FAILED: "ATTACK_FAILED",
  INVALID_PLAYER: "INVALID_PLAYER",
  CARD_NOT_ON_FIELD: "CARD_NOT_ON_FIELD",
  INVALID_ABILITY: "INVALID_ABILITY",
  NOT_YOUR_TURN: "NOT_YOUR_TURN",
  CARD_NOT_FOUND: "CARD_NOT_FOUND",
  NOT_ENOUGH_GOLD: "NOT_ENOUGH_GOLD",
  FIELD_FULL: "FIELD_FULL",
  CANNOT_ATTACK_STATE: "CANNOT_ATTACK_STATE",
  NO_UNIT_TO_ATTACK: "NO_UNIT_TO_ATTACK",
  ALREADY_ATTACKED: "ALREADY_ATTACKED",
  TARGET_NOT_FOUND: "TARGET_NOT_FOUND",
  ATTACK_ENEMY_ONLY: "ATTACK_ENEMY_ONLY",
  DECK_FULL: "DECK_FULL",
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// 타겟 
export const TargetSource = {
  ENEMY_FIELD: "enemy-field",
  PLAYER: "player",
  PLAYER_FIELD: "player-field",
  NONE: "none"
} as const;
export type TargetSource = (typeof TargetSource)[keyof typeof TargetSource];

// 덱 에러 메시지
export const DeckErrorMessages = {
  MIN_DECK_SIZE: (min: number) => `덱은 최소 ${min}장 이상이어야 합니다.`,
  MAX_DECK_SIZE: (max: number) => `덱은 최대 ${max}장까지만 구성할 수 있습니다.`,
  MAX_COPIES_PER_CARD: (cardName: string, max: number) => `'${cardName}' 카드는 최대 ${max}장까지만 넣을 수 있습니다.`
} as const;
