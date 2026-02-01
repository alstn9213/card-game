import { GameState, Entity, FieldUnit, TargetSource, UnitCard, createError, ErrorCode } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';

export interface TargetResult {
  target: Entity | FieldUnit | undefined;
  index: number;
  source: TargetSource;
}

export class GameUtils {

  /**
   * 게임 상태(GameState)에서 ID를 기반으로 대상을 찾는 함수.
   * 적 유닛, 플레이어 본체, 플레이어 유닛 순으로 검색.
   */
  public static findTarget(state: GameState, targetId: string): TargetResult {
  
    const enemyIndex = state.enemyField.findIndex(u => u?.id === targetId);
    const playerIndex = state.playerField.findIndex(u => u?.id === targetId);
    
    // 적 유닛 확인
    if (enemyIndex !== -1) {
      return { target: state.enemyField[enemyIndex]!, index: enemyIndex, source: TargetSource.ENEMY_FIELD };
    }
    
    // 플레이어 본체 확인
    if (targetId === state.player.id) {
      return { target: state.player, index: -1, source: TargetSource.PLAYER };
    }
    
    // 플레이어 유닛 확인
    if (playerIndex !== -1) {
      return { target: state.playerField[playerIndex]!, index: playerIndex, source: TargetSource.PLAYER_FIELD };
    }

    return { target: undefined, index: -1, source: TargetSource.NONE };
  }

  /**
   * 유닛의 체력이 0 이하일 경우 필드에서 제거하는 함수.
   * 플레이어는 제거되지 않음 (게임 종료 조건에서 처리).
   */
  public static processUnitDeath(state: GameState, result: TargetResult): void {
    const { target, index, source } = result;
    if (!target || target.currentHp > 0) return;

    if (source === TargetSource.ENEMY_FIELD) {
      const enemyUnit = target as FieldUnit;
      const reward = enemyUnit.cost; 
      state.currentGold += reward;
      state.enemyField[index] = null;
    } 
    
    else if (source === TargetSource.PLAYER_FIELD) {
      state.playerField[index] = null;
    }
  }

  /**
   * Fisher-Yates 알고리즘을 사용한 배열 셔플 함수
   */
  public static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]; // 원본 보존을 위해 복사
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 덱에서 카드를 1장 드로우하여 핸드에 추가합니다.
   * 핸드가 가득 차거나(5장) 덱이 비어있으면 중단합니다.
   */
  public static drawCard(state: GameState, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      if (state.hand.length >= 5) break;
      if (state.deck.length === 0) break;

      const card = state.deck.shift();
      if (card) state.hand.push(card);
    }
  }

  /**
   * 플레이어 필드의 빈 슬롯에 유닛을 소환합니다.
   */
  public static summonUnit(state: GameState, cardData: UnitCard): FieldUnit {
    const emptySlotIndex = state.playerField.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      throw createError(ErrorCode.FIELD_FULL);
    }

    const newUnit: FieldUnit = {
      id: uuidv4(),
      ownerId: state.player.id,
      cardId: cardData.cardId,
      name: cardData.name,
      cost: cardData.cost,
      type: cardData.type,
      targetType: cardData.targetType,
      description: cardData.description,
      attackPower: cardData.attackPower,
      maxHp: cardData.maxHp,
      currentHp: cardData.maxHp,
      hasAttacked: false, 
    };
    state.playerField[emptySlotIndex] = newUnit;
    return newUnit;
  }

  public static earnGold(state: GameState, amount: number) {
    state.currentGold += amount;
  }
  
}
