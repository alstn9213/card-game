import { GameState, UNIT_CARDS, FieldUnit } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { EnemyAI } from "./EnemyAI";


export class EnemyManager {
  private ai: EnemyAI;

  constructor(private getState: () => GameState) {
    this.ai = new EnemyAI();
  }

  // 몬스터 카드 소환
  public spawnNewEnemy(state: GameState): FieldUnit {
    const emptySlotIndex = state.enemyField.findIndex((slot) => slot === null);
    if (emptySlotIndex === -1) return;

    const randomUnit = UNIT_CARDS[Math.floor(Math.random() * UNIT_CARDS.length)];

    const newUnit: FieldUnit = {
      id: uuidv4(),
      cardId: randomUnit.cardId,
      name: randomUnit.name,
      cost: randomUnit.cost,
      type: randomUnit.type,
      targetType: randomUnit.targetType,
      description: randomUnit.description,
      attackPower: randomUnit.attackPower,
      maxHp: randomUnit.maxHp,
      currentHp: randomUnit.maxHp,
      hasAttacked: false,
    };

    state.enemyField[emptySlotIndex] = newUnit;
    return newUnit;
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