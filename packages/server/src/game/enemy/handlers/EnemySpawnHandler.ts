import { GameState, UNIT_CARDS, UnitCard } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { GameUtils } from "../../utils/GameUtils";

export class EnemySpawnHandler {
  
  public execute(state: GameState): void {
    state.enemyField = [null, null, null, null, null];
    state.currentRoundEnemies = [];
    
    const spawnCount = this.calculateSpawnCount(state.round);
    const availableSlots = GameUtils.shuffleArray([0, 1, 2, 3, 4]);

    // 라운드에 따라 등장 가능한 유닛 필터링
    const candidateUnits = this.getUnitsForRound(state.round);

    // 몬스터 배치
    for (let i = 0; i < spawnCount; i++) {
      const slotIndex = availableSlots[i];
      const pool = candidateUnits.length > 0 ? candidateUnits : UNIT_CARDS;
      const randomUnit = pool[Math.floor(Math.random() * pool.length)];

      const stack = this.calculateStack(state.round);

      state.enemyField[slotIndex] = {
        ...randomUnit,
        id: uuidv4(),
        maxHp: randomUnit.maxHp * stack,
        attackPower: randomUnit.attackPower * stack,
        currentHp: randomUnit.maxHp * stack,
        hasAttacked: false,
        cardStack: stack
      };

      // 이번 라운드에 등장한 적 기록 (상점 판매용)
      state.currentRoundEnemies.push(randomUnit);
    }
  }

  // 라운드별 스폰 수 계산 헬퍼
  private calculateSpawnCount(round: number): number {
    let min = 1;
    let max = 2;

    if (round >= 20) {
      min = 4;
      max = 5;
    } else if (round >= 15) {
      min = 3;
      max = 5;
    } else if (round >= 10) {
      min = 3;
      max = 4;
    } else if (round >= 5) {
      min = 2;
      max = 3;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 라운드별 유닛 스택(레벨) 계산 헬퍼
  private calculateStack(round: number): number {
    // 10라운드마다 기본 스택 1 증가 (1~10: 1, 11~20: 2 ...)
    const baseStack = Math.ceil(round / 10);
    // 20% 확률로 +1 스택 (엘리트 몬스터 느낌)
    const bonus = Math.random() < 0.2 ? 1 : 0;
    return baseStack + bonus;
  }

  // 라운드별 등장 유닛 필터링 헬퍼
  private getUnitsForRound(round: number): UnitCard[] {
    // 10라운드마다 최대 코스트 증가 (1~10: 1코스트, 11~20: 2코스트 ...)
    const maxCost = Math.min(5, Math.ceil(round / 10));
    
    // 최소 코스트 설정 (현재 최대 코스트 - 1 까지만 등장하여 난이도 유지)
    const minCost = Math.max(1, maxCost - 1);

    return UNIT_CARDS.filter(card => card.cost >= minCost && card.cost <= maxCost);
  }
}