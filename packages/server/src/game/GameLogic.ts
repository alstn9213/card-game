import { 
  GameState, 
  Entity, 
  UNIT_CARDS, 
  SPELL_CARDS, 
  FieldUnit, 
  UnitCard, 
  SpellCard,
  CardType
} from "@card-game/shared";

export class GameLogic {
  private state: GameState;

  constructor() {
    this.state = this.initializeGame();
  }

  public getState(): GameState {
    return this.state;
  }

  private initializeGame(): GameState {
    const player: Entity = { id: "player", name: "Hero", maxHp: 4000, currentHp: 4000 };
    
    const randomUnit = UNIT_CARDS[Math.floor(Math.random() * UNIT_CARDS.length)];
    const enemy: Entity = { 
      id: "enemy", 
      name: randomUnit.name, 
      maxHp: randomUnit.hp, 
      currentHp: randomUnit.hp,
      attackPower: randomUnit.attackPower,
      cost: randomUnit.cost
    };
    
    const deck = [...UNIT_CARDS, ...SPELL_CARDS];
    const hand = deck.splice(0, 5);

    return {
      player,
      enemy,
      hand,
      deck,
      playerField: Array(5).fill(null), // 5칸의 빈 필드로 초기화
      enemyField: Array(5).fill(null),
      discardPile: [],
      currentGold: 5,
      turn: 1,
      isPlayerTurn: true,
      gameStatus: "playing",
    };
  }

  public playCard(cardIndex: number): { success: boolean; message?: string } {
    if (!this.state.isPlayerTurn || this.state.gameStatus !== "playing") {
      return { success: false, message: "상대 차례입니다" };
    }

    const card = this.state.hand[cardIndex];
    if (!card) {
        return { success: false, message: "카드가 존재하지 않습니다." };
    }

    if (this.state.currentGold < card.cost) {
      return { success: false, message: "금화가 부족합니다." };
    }

    if (card.type === CardType.UNIT) {
       const emptySlotIndex = this.state.playerField.findIndex(slot => slot === null);

       if (emptySlotIndex === -1) {
         return { success: false, message: "필드가 가득 찼습니다" };
       }

       const newUnit: FieldUnit = {
         id: Math.random().toString(36).substr(2, 9),
         cardId: card.id,
         name: card.name,
         attackPower: (card as UnitCard).attackPower,
         maxHp: (card as UnitCard).hp,
         currentHp: (card as UnitCard).hp,
         hasAttacked: true, // 소환 후유증 (바로 공격 불가)
       };
       
       this.state.playerField[emptySlotIndex] = newUnit;

    } else if (card.type === CardType.SPELL) {
       this.executeSpellEffect(card as SpellCard);
    }

    this.state.currentGold -= card.cost;
    this.state.hand.splice(cardIndex, 1);
    this.state.discardPile.push(card);

    this.checkGameOver();
    return { success: true };
  }

  public attack(attackerId: string, targetId: string): { success: boolean; message?: string } {
    if (!this.state.isPlayerTurn || this.state.gameStatus !== "playing") {
      return { success: false, message: "공격할 수 없는 상태입니다." };
    }

    // 1. 공격자(플레이어 유닛) 찾기
    const attacker = this.state.playerField.find(u => u?.id === attackerId);
    if (!attacker) {
      return { success: false, message: "공격할 유닛이 없습니다." };
    }

    if (attacker.hasAttacked) {
      return { success: false, message: "이미 공격한 유닛입니다." };
    }

    // 2. 대상 찾기 (적 본체 또는 적 유닛)
    let target: Entity | FieldUnit | undefined;
    let targetUnitIndex = -1;

    if (targetId === "enemy") {
      target = this.state.enemy;
    } else {
      targetUnitIndex = this.state.enemyField.findIndex(u => u?.id === targetId);
      if (targetUnitIndex !== -1) {
        target = this.state.enemyField[targetUnitIndex]!;
      }
    }

    if (!target) {
      return { success: false, message: "대상을 찾을 수 없습니다." };
    }

    // 3. 데미지 적용
    target.currentHp -= attacker.attackPower;

    // 4. 공격권 소모
    attacker.hasAttacked = true;

    // 4. 적 유닛 처치 시 필드에서 제거 (적 본체 처리는 checkGameOver에서 담당)
    if (target.currentHp <= 0 && targetUnitIndex !== -1) {
      this.state.enemyField[targetUnitIndex] = null;
    }

    this.checkGameOver();
    return { success: true };
  }

  private executeSpellEffect(card: SpellCard) {
    switch (card.id) {
      case "breath of fire":
        this.state.enemy.currentHp -= card.value;
        break;
      case "recovery":
        this.state.player.currentHp = Math.min(
          this.state.player.maxHp, 
          this.state.player.currentHp + card.value
        );
        break;
    }
  }

  public endTurn() {
    if (!this.state.isPlayerTurn) return;
    this.state.isPlayerTurn = false;
  }

  public processEnemyTurn() {
    if (this.state.gameStatus !== "playing") return;

    // 1. 적 본체 공격
    const enemyHeroDamage = this.state.enemy.attackPower || 0;
    if (enemyHeroDamage > 0) {
      this.state.player.currentHp -= enemyHeroDamage;
    }

    // 2. 적 유닛 공격 AI
    this.state.enemyField.forEach(enemyUnit => {
      if (!enemyUnit) return;
      if (this.state.player.currentHp <= 0) return; // 플레이어가 이미 죽었으면 중단

      // 공격 대상 선정 (플레이어 본체 또는 유닛)
      const playerUnits = this.state.playerField
        .map((u, i) => ({ unit: u, index: i }))
        .filter(item => item.unit !== null);

      // 유닛이 있으면 50% 확률로 유닛 공격, 아니면 본체 공격
      if (playerUnits.length > 0 && Math.random() < 0.5) {
        const target = playerUnits[Math.floor(Math.random() * playerUnits.length)];
        const targetUnit = this.state.playerField[target.index]!;
        
        targetUnit.currentHp -= enemyUnit.attackPower;
        
        // 유닛 처치 처리
        if (targetUnit.currentHp <= 0) {
          this.state.playerField[target.index] = null;
        }
      } else {
        // 본체 공격
        this.state.player.currentHp -= enemyUnit.attackPower;
      }
    });

    this.startPlayerTurn();
  }

  private startPlayerTurn() {
    this.state.turn++;
    this.state.isPlayerTurn = true;

    // 플레이어 유닛들의 공격권 초기화
    this.state.playerField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    while (this.state.hand.length < 5 && this.state.deck.length > 0) {
      this.state.hand.push(this.state.deck.shift()!);
    }

    this.checkGameOver();
  }

  private checkGameOver() {
    if (this.state.player.currentHp <= 0) {
      this.state.gameStatus = "defeat";
    } else if (this.state.enemy.currentHp <= 0) {
      if (this.state.enemy.cost) {
        this.state.currentGold += this.state.enemy.cost;
      }
      this.startNextRound();
    }
  }

  private startNextRound() {
    const randomUnit = UNIT_CARDS[Math.floor(Math.random() * UNIT_CARDS.length)];
    this.state.enemy = {
      id: "enemy",
      name: randomUnit.name,
      maxHp: randomUnit.hp,
      currentHp: randomUnit.hp,
      attackPower: randomUnit.attackPower,
      cost: randomUnit.cost
    };
  }
}
