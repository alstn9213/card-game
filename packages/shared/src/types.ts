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

// 타겟 
export const TargetSource = {
  ENEMY_FIELD: "enemy-field",
  PLAYER: "player",
  PLAYER_FIELD: "player-field",
  NONE: "none"
} as const;
export type TargetSource = (typeof TargetSource)[keyof typeof TargetSource];

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

// 덱 에러 메시지
export const DeckErrorMessages = {
  MIN_DECK_SIZE: (min: number) => `덱은 최소 ${min}장 이상이어야 합니다.`,
  MAX_DECK_SIZE: (max: number) => `덱은 최대 ${max}장까지만 구성할 수 있습니다.`,
  MAX_COPIES_PER_CARD: (cardName: string, max: number) => `'${cardName}' 카드는 최대 ${max}장까지만 넣을 수 있습니다.`
} as const;

// 게임 에러 메시지 (UI 표시용)
export const GameErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.GAME_NOT_STARTED]: "게임이 시작되지 않았습니다.",
  [ErrorCode.ABILITY_USE_FAILED]: "능력 사용 실패",
  [ErrorCode.PLAY_CARD_FAILED]: "카드 사용 실패",
  [ErrorCode.ATTACK_FAILED]: "공격 실패",
  
  [ErrorCode.INVALID_PLAYER]: "잘못된 플레이어입니다.",
  [ErrorCode.CARD_NOT_ON_FIELD]: "카드가 필드에 없습니다.",
  [ErrorCode.INVALID_ABILITY]: "유효하지 않은 능력입니다.",

  [ErrorCode.NOT_YOUR_TURN]: "상대 차례입니다",
  [ErrorCode.CARD_NOT_FOUND]: "카드가 존재하지 않습니다.",
  [ErrorCode.NOT_ENOUGH_GOLD]: "금화가 부족합니다.",
  [ErrorCode.FIELD_FULL]: "필드가 가득 찼습니다",
  [ErrorCode.CANNOT_ATTACK_STATE]: "공격할 수 없는 상태입니다.",
  [ErrorCode.NO_UNIT_TO_ATTACK]: "공격할 유닛이 없습니다.",
  [ErrorCode.ALREADY_ATTACKED]: "이미 공격한 유닛입니다.",
  [ErrorCode.TARGET_NOT_FOUND]: "대상을 찾을 수 없습니다.",
  [ErrorCode.ATTACK_ENEMY_ONLY]: "적군만 공격할 수 있습니다.",
  
  [ErrorCode.DECK_FULL]: "덱이 가득 찼습니다.",

  [ErrorCode.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다."
};
