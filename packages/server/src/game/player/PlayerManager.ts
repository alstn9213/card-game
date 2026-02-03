import { SpellManager } from './../spells/SpellManager';
import { GameState, ErrorCode, createError, GameStatus, CardType, FieldUnit, TargetSource, GameCard } from "@card-game/shared";
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
  public playCard(cardIndex: number, targetId?: string): GameCard | null {
    const state = this.getState();

    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }

    const card = state.hand[cardIndex];

    if (!card) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    if (card.type === CardType.UNIT || card.type === CardType.SPELL) {
      // playCardHandler가 실행 후 사용된 카드를 반환한다고 가정
      // (실제로는 PlayCardHandler.ts에서 반환 로직 추가 필요)
      this.playCardHandler.execute(cardIndex, targetId);
      return card;
    } 
    return null;
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

  public mergeFieldUnits(sourceId: string, targetId: string): FieldUnit {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    return this.mergeHandler.execute(sourceId, targetId);
  }

  public mergeHandCard(cardIndex: number, targetId: string): FieldUnit {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    return this.mergeHandler.execute(cardIndex, targetId);
  }
}