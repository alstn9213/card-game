import { SpellManager } from './../spells/SpellManager';
import { GameState, ErrorCode, createError, GameStatus, CardType } from "@card-game/shared";
import { PlayCardHandler } from "./handlers/PlayCardHandler";
import { AttackHandler } from "./handlers/AttackHandler";
import { GameUtils } from "../utils/GameUtils";

export class PlayerManager {
  private playCardHandler: PlayCardHandler;
  private attackHandler: AttackHandler;
  private spellManager: SpellManager;


  constructor(
    private getState: () => GameState
  ) {
    this.spellManager = new SpellManager(getState);
    this.playCardHandler = new PlayCardHandler(getState, this.spellManager);
    this.attackHandler = new AttackHandler(getState);

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
}