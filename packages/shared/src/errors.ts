import { DeckRules } from "./types";

// 에러 코드
export const ErrorCode = {
  GAME_NOT_STARTED: "게임이 시작되지 않았습니다.",
  GAME_NOT_SHOP: "상점 단계가 아닙니다.",
  NOT_YOUR_TURN: "상대 차례입니다",
  NOT_ENEMY_TURN: "플레이어 차례입니다",
  CARD_NOT_ON_FIELD: "카드가 필드에 없습니다.",
  CARD_NOT_FOUND: "카드를 찾을 수 없습니다.",
  FIELD_FULL: "필드가 가득 찼습니다",
  NOT_ENOUGH_GOLD: "금화가 부족합니다.",
  ATTACK_FAILED: "공격 실패",
  CANNOT_ATTACK_STATE: "공격할 수 없는 상태입니다.",
  ALREADY_ATTACKED: "이미 공격한 유닛입니다.",
  TARGET_NOT_FOUND: "대상을 찾을 수 없습니다.",
  ATTACK_ENEMY_ONLY: "적군만 공격할 수 있습니다.",
  DECK_FULL: "덱이 가득 찼습니다.",
  MIN_DECK_SIZE: `덱은 최소 ${DeckRules.MIN_DECK_SIZE}장 이상이어야 합니다.`,
  MAX_DECK_SIZE: `덱은 최대 ${DeckRules.MAX_DECK_SIZE}장 까지만 구성할 수 있습니다.`,
  MAX_COPIES_PER_CARD: `동일 카드는 ${DeckRules.MAX_COPIES_PER_CARD}장까지만 넣을 수 있습니다.`,
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface GameError {
  code: ErrorCode;
  message: string;
}

export const createError = (code: ErrorCode): GameError => ({
  code,
  message: code
});