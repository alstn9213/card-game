import { GameState, UNIT_CARDS, FieldUnit } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { EnemyAI } from "./EnemyAI";


export class EnemyManager {
  private ai: EnemyAI;

  constructor(private getState: () => GameState) {
    this.ai = new EnemyAI();
  }

  // 몬스터 카드 소환 (랜덤 1~5마리, 랜덤 위치)
  public spawnRandomEnemies(state: GameState): void {
    // 1. 적 필드 초기화
    state.enemyField = [null, null, null, null, null];

    // 2. 소환할 몬스터 수 결정 (1 ~ 5)
    const spawnCount = Math.floor(Math.random() * 5) + 1;

    // 3. 소환할 위치 결정 (0~4 인덱스 중 랜덤하게 선택)
    const availableSlots = [0, 1, 2, 3, 4];
    // 배열 섞기 (Fisher-Yates Shuffle)
    for (let i = availableSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
    }

    // 4. 몬스터 배치
    for (let i = 0; i < spawnCount; i++) {
      const slotIndex = availableSlots[i];
      const randomUnit = UNIT_CARDS[Math.floor(Math.random() * UNIT_CARDS.length)];

      state.enemyField[slotIndex] = {
        ...randomUnit,
        id: uuidv4(),
        currentHp: randomUnit.maxHp,
        hasAttacked: false,
      };
    }
  }

  // 적 턴 진행 (AI 로직)
  public executeTurn(): void {
    const state = this.getState();
    if (state.gameStatus !== "playing") return;

    // 턴 시작 시 기존 유닛들의 공격권 초기화
    state.enemyField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    // AI에게 턴 실행 위임
    this.ai.executeTurn(state);
  }
}