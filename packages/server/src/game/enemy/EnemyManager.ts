import { GameState, UNIT_CARDS } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { GameUtils } from "../utils/GameUtils";
import { AiAttackHandler } from "./handlers/AiAttackHandler";


export class EnemyManager {
  private aiAttackHandler: AiAttackHandler;

  constructor(private getState: () => GameState) {
    this.aiAttackHandler = new AiAttackHandler(getState);
  }

  // 몬스터 카드 소환
  public spawnRandomEnemies(state: GameState): void {
    state.enemyField = [null, null, null, null, null];
    state.currentRoundEnemies = [];
    const spawnCount = Math.floor(Math.random() * 3) + 1;
    const availableSlots = GameUtils.shuffleArray([0, 1, 2, 3, 4]);

    // 몬스터 배치
    for (let i = 0; i < spawnCount; i++) {
      const slotIndex = availableSlots[i];
      const randomUnit = UNIT_CARDS[Math.floor(Math.random() * UNIT_CARDS.length)];

      state.enemyField[slotIndex] = {
        ...randomUnit,
        id: uuidv4(),
        currentHp: randomUnit.maxHp,
        hasAttacked: false,
      };

      // 이번 라운드에 등장한 적 기록 (상점 판매용)
      state.currentRoundEnemies.push(randomUnit);
    }
  }

  // 적 턴 진행 (AI 로직)
  public executeTurn(): void {
    const state = this.getState();

    // 턴 시작 시 기존 유닛들의 공격권 초기화
    state.enemyField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    this.aiAttackHandler.execute(state);
  }
}