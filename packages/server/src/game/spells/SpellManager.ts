import { GameState, SpellCard, EffectType } from '@card-game/shared';
import { GoldHandler } from './handlers/GoldHandler';
import { DrawHandler } from './handlers/DrawHandler';
export class SpellManager {
  private goldHandler: GoldHandler;
  private drawHandler: DrawHandler;

  constructor(
    private getState: () => GameState
  ) {
      this.goldHandler = new GoldHandler(getState);
      this.drawHandler = new DrawHandler(getState);
    
    }

  public execute(card: SpellCard, cardIndex: number, targetId?: string): void {
    switch (card.effectType) {
      case EffectType.GOLD:
        this.goldHandler.execute(cardIndex, card.value ?? 0);
        break;
      case EffectType.DRAW:
        this.drawHandler.execute(cardIndex, card.value ?? 1);
        break;
    }
  }
}