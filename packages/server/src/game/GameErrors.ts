import { ErrorCode, GameError } from "@card-game/shared";

const ErrorMessages: Record<ErrorCode, string> = {
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
  [ErrorCode.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다."
};

export const createError = (code: ErrorCode, customMessage?: string): GameError => ({
  code,
  message: customMessage || ErrorMessages[code] || ErrorMessages[ErrorCode.UNKNOWN_ERROR]
});
