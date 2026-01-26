import { GameState, UNIT_CARDS, FieldUnit } from "@card-game/shared";
import { GameUtils } from "../utils/GameUtils";
import { v4 as uuidv4 } from 'uuid';


export class EnemyManager {
  constructor(private getState: () => GameState) {}


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

    // 공격 AI
    state.enemyField.forEach((enemyUnit) => {
      if (!enemyUnit) return;
      if (enemyUnit.hasAttacked) return;
      if (state.player.currentHp <= 0) return;

      const playerUnits = state.playerField
        .map((u, i) => ({ unit: u, index: i }))
        .filter((item) => item.unit !== null);

      if (playerUnits.length > 0) {
        const target = playerUnits[Math.floor(Math.random() * playerUnits.length)];
        const targetUnit = state.playerField[target.index]!;

        targetUnit.currentHp -= enemyUnit.attackPower;

        GameUtils.processUnitDeath(state, {
          target: targetUnit,
          index: target.index,
          source: "player-field"
        });
      } else if(state.player.currentHp > 0){
        state.player.currentHp -= enemyUnit.attackPower;
      } 
      
      if (state.player.currentHp <= 0) {
        state.gameStatus = "defeat";
        return;
      }

      enemyUnit.hasAttacked = true;
    });
  }

 
}