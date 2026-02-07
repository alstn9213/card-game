import { TargetSource, type FieldUnit, type GameState } from "@card-game/shared";

/**
 * 로그를 기반으로 게임 상태에 데미지를 적용합니다.
 * 주로 클라이언트 측 예측이나 애니메이션 동기화에 사용됩니다.
 */
export const applyLogToState = (state: GameState, log: { targetId: string; damage: number; attackerId?: string }): GameState => {
  const newState = JSON.parse(JSON.stringify(state));
  
  if (log.targetId === TargetSource.PLAYER) {
    newState.player.currentHp = Math.max(0, newState.player.currentHp - log.damage);
  } else {
    const pIndex = newState.playerField.findIndex((u: FieldUnit) => u?.id === log.targetId);
    if (pIndex !== -1 && newState.playerField[pIndex]) {
      newState.playerField[pIndex]!.currentHp -= log.damage;
      if (newState.playerField[pIndex]!.currentHp <= 0) {
        newState.playerField[pIndex] = null;
      }
    }

    const eIndex = newState.enemyField.findIndex((u: FieldUnit) => u?.id === log.targetId);
    if (eIndex !== -1 && newState.enemyField[eIndex]) {
      newState.enemyField[eIndex]!.currentHp -= log.damage;
      if (newState.enemyField[eIndex]!.currentHp <= 0) {
        newState.enemyField[eIndex] = null;
      }
    }
  }

  // 공격자 상태 업데이트 (공격 모션 후 hasAttacked 처리)
  if (log.attackerId) {
    const eIndex = newState.enemyField.findIndex((u: FieldUnit) => u?.id === log.attackerId);
    if (eIndex !== -1 && newState.enemyField[eIndex]) {
      newState.enemyField[eIndex]!.hasAttacked = true;
    }
    
    const pIndex = newState.playerField.findIndex((u: FieldUnit) => u?.id === log.attackerId);
    if (pIndex !== -1 && newState.playerField[pIndex]) {
      newState.playerField[pIndex]!.hasAttacked = true;
    }
  }
  return newState;
};

/**
 * 서버로부터 받은 새로운 상태와 현재 상태를 비교하여,
 * 애니메이션 처리를 위한 중간 상태(로그만 업데이트하고 유닛 상태는 유지)를 반환할지 결정합니다.
 */
export const calculateSyncedState = (prevState: GameState | null, newState: GameState): GameState => {
  // 새로운 공격 로그가 있는지 확인 (적 턴 공격 애니메이션 동기화)
  if (prevState && newState.attackLogs.length > prevState.attackLogs.length) {
    // 로그만 먼저 업데이트하여 애니메이션 트리거 (유닛 상태는 이전 상태 유지)
    return {
      ...newState, // 기본적으로 최신 상태를 따르되 (골드, 핸드 등)
      attackLogs: newState.attackLogs,
      
      // 전투 관련 필드와 플레이어 체력은 이전 상태로 롤백하여 애니메이션 진행
      playerField: prevState.playerField,
      enemyField: prevState.enemyField,
      player: {
        ...newState.player,
        currentHp: prevState.player.currentHp
      }
    };
  }
  
  return newState;
};
