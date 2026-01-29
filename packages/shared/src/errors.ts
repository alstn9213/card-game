// 에러 코드
export const ErrorCode = {
  GAME_NOT_STARTED: "게임이 시작되지 않았습니다.",
  ABILITY_USE_FAILED: "능력 사용 실패",
  PLAY_CARD_FAILED: "카드 사용 실패",
  ATTACK_FAILED: "공격 실패",
  INVALID_PLAYER: "잘못된 플레이어입니다.",
  CARD_NOT_ON_FIELD: "카드가 필드에 없습니다.",
  INVALID_ABILITY: "유효하지 않은 능력입니다.",
  NOT_YOUR_TURN: "상대 차례입니다",
  CARD_NOT_FOUND: "카드가 존재하지 않습니다.",
  NOT_ENOUGH_GOLD: "금화가 부족합니다.",
  FIELD_FULL: "필드가 가득 찼습니다",
  CANNOT_ATTACK_STATE: "공격할 수 없는 상태입니다.",
  NO_UNIT_TO_ATTACK: "공격할 유닛이 없습니다.",
  ALREADY_ATTACKED: "이미 공격한 유닛입니다.",
  TARGET_NOT_FOUND: "대상을 찾을 수 없습니다.",
  ATTACK_ENEMY_ONLY: "적군만 공격할 수 있습니다.",
  DECK_FULL: "덱이 가득 찼습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다."
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// 덱 에러 메시지
export const DeckErrorMessages = {
  MIN_DECK_SIZE: (min: number) => `덱은 최소 ${min}장 이상이어야 합니다.`,
  MAX_DECK_SIZE: (max: number) => `덱은 최대 ${max}장까지만 구성할 수 있습니다.`,
  MAX_COPIES_PER_CARD: (cardName: string, max: number) => `'${cardName}' 카드는 최대 ${max}장까지만 넣을 수 있습니다.`
} as const;