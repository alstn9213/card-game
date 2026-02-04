import { SpellManager } from './../spells/SpellManager';
import { GameState, ErrorCode, createError, GameStatus, CardType, FieldUnit, TargetSource, GameCard } from "@card-game/shared";
import { PlayCardHandler } from "./handlers/PlayCardHandler";
import { AttackHandler } from "./handlers/AttackHandler";
import { MergeHandler } from "./handlers/MergeHandler";

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