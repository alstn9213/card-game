import { SpellManager } from './../spells/SpellManager';
import { GameState, ErrorCode, createError, GameStatus, CardType, FieldUnit, TargetSource } from "@card-game/shared";
import { PlayCardHandler } from "./handlers/PlayCardHandler";
import { AttackHandler } from "./handlers/AttackHandler";
import { MergeHandler } from "./handlers/MergeHandler";
import { GameUtils } from "../utils/GameUtils";

export class PlayerManager {
  private playCardHandler: PlayCardHandler;
  private attackHandler: AttackHandler;
  private mergeHandler: MergeHandler;
  private spellManager: SpellManager;


  constructor(
    private getState: () => GameState
  ) {
    this.spellManager = new SpellManager(getState);
    this.playCardHandler = new PlayCardHandler(getState, this.spellManager);
    this.attackHandler = new AttackHandler(getState);
    this.mergeHandler = new MergeHandler(getState);

  }

  // 카드 소환 함수
  public playCard(cardIndex: number, targetId?: string): void {
    const state = this.getState();

    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }

    const card = state.hand[cardIndex];

    if (!card) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    // 유닛 카드이고 타겟이 지정된 경우 병합(Merge) 로직 시도
    if (card.type === CardType.UNIT && targetId) {
      const targetResult = GameUtils.findTarget(state, targetId);

      // 타겟이 내 필드의 유닛이고, 카드의 종류가 같다면 병합 진행
      if (targetResult.source === TargetSource.PLAYER_FIELD && targetResult.target) {
        const targetUnit = targetResult.target as FieldUnit;

        if (targetUnit.cardId === card.cardId) {
          this.mergeHandler.execute(cardIndex, targetUnit);
          return;
        }
      }
    }

    if (card.type === CardType.UNIT || card.type === CardType.SPELL) {
      this.playCardHandler.execute(cardIndex, targetId);
    } 
    
  }

  // 공격 함수
  public attack(attackerId: string, targetId: string): void {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    this.attackHandler.execute(attackerId, targetId);
  }

  // 라운드 시작시, 조건 초기화 함수
  public onTurnStart() {
    const state = this.getState();

    // 유닛 공격권 초기화
    state.playerField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    GameUtils.drawCard(state);
  }

  public mergeFieldUnits(sourceId: string, targetId: string): void {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    this.mergeHandler.executeFieldMerge(sourceId, targetId);
  }
}