import { FieldUnit, ClientToServerEvents, Entity, GameState, ServerToClientEvents, SPELL_CARDS, SpellCard, UNIT_CARDS, UnitCard } from "@card-game/shared";
import { Socket } from "socket.io";


export class GameSession {
  private state: GameState;
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;

  constructor(socket: Socket) {
    this.state = this.initializeGame();
    this.socket = socket;
    
    // 클라이언트에게 초기 상태 전송
    this.broadcastState();
    
    // 이벤트 리스너 등록
    this.setupListeners();
  }

  private initializeGame(): GameState {
    const player: Entity = { id: "player", name: "Hero", maxHp: 4000, currentHp: 4000};
    const enemy: Entity = { id: "enemy", name: "Slime", maxHp: 500, currentHp: 500};
    
    // 덱 셔플 및 초기 핸드 뽑기 로직
    const deck = [...UNIT_CARDS, ...SPELL_CARDS]; // 임시 덱 생성
    const hand = deck.splice(0, 5);

    return {
      player,
      enemy,
      hand,
      deck,
      playerField: [],
      enemyField: [],
      discardPile: [],
      currentGold: 5,
      turn: 1,
      isPlayerTurn: true,
      gameStatus: "playing",
    };
  }

  private setupListeners() {
    this.socket.on("playCard", (cardIndex: number) => {
      this.handlePlayCard(cardIndex);
    });

    this.socket.on("endTurn", () => {
      this.handleEndTurn();
    });
  }

  private handlePlayCard(cardIndex: number) {
    if (!this.state.isPlayerTurn || this.state.gameStatus !== "playing") {
      this.socket.emit("error", "상대 차례입니다");
      return;
    }

    const card = this.state.hand[cardIndex];

    if (card.type === "UNIT") {
       // 유닛 소환 로직
       const emptySlotIndex = this.state.playerField.findIndex(slot => slot === null);

       if (emptySlotIndex === -1) {
         this.socket.emit("error", "필드가 가득 찼습니다");
         return; // 골드 소모 안 하고 중단
       }

       // 카드를 전장 유닛으로 변환하여 배치
       const newUnit: FieldUnit = {
         id: Math.random().toString(36).substr(2, 9), // 임시 ID 생성
         cardId: card.id,
         name: card.name,
         attackPower: (card as UnitCard).attackPower,
         maxHp: (card as UnitCard).hp,
         currentHp: (card as UnitCard).hp,
       };
       
       this.state.playerField[emptySlotIndex] = newUnit;

    } else if (card.type === "SPELL") {
       // 주문 효과 로직 (Switch 문으로 카드 ID별 효과 처리)
       this.executeSpellEffect(card as SpellCard);
    }

    if (this.state.currentGold < card.cost) {
      this.socket.emit("error", "금화가 부족합니다.");
      return;
    }

    // 금화 소모
    this.state.currentGold -= card.cost;

    // 묘지에 카드 버리기
    this.state.hand.splice(cardIndex, 1);
    this.state.discardPile.push(card);

    // 승패 체크
    this.checkGameOver();

    // 상태 업데이트 전송
    this.broadcastState();
  }

  // 주문 효과 처리 함수 분리
  private executeSpellEffect(card: SpellCard) {
    switch (card.id) {
      case "breath of fire":
        // 적 본체 공격 (추후 적 필드 유닛 타겟팅 기능 필요)
        this.state.enemy.currentHp -= card.value;
        break;
      case "recovery":
        // 플레이어 회복
        this.state.player.currentHp = Math.min(
          this.state.player.maxHp, 
          this.state.player.currentHp + card.value
        );
        break;
    }
  }

  private handleEndTurn() {
    if (!this.state.isPlayerTurn) return;

    this.state.isPlayerTurn = false;
    this.broadcastState();

    // 적의 턴 진행 (약간의 지연 효과)
    setTimeout(() => {
      this.processEnemyTurn();
    }, 1000);
  }

  private processEnemyTurn() {
    if (this.state.gameStatus !== "playing") return;

    // 적 AI 로직 (단순 공격)
    const damage = 400;
    let actualDamage = damage;
  
    this.state.player.currentHp -= actualDamage;

    // 턴 종료 처리 (플레이어 턴 시작)
    this.startPlayerTurn();
  }

  private startPlayerTurn() {
    this.state.turn++;
    this.state.isPlayerTurn = true;

    // 카드 드로우 (5장까지 채우기)
    // 덱이 비었을 때, 더 뽑지 못함.
    while (this.state.hand.length < 5 && this.state.deck.length > 0) {
      this.state.hand.push(this.state.deck.shift()!);
    }

    this.checkGameOver();
    this.broadcastState();
  }

  private checkGameOver() {
    if (this.state.player.currentHp <= 0) {
      this.state.gameStatus = "defeat";
    } else if (this.state.enemy.currentHp <= 0) {
      this.state.gameStatus = "victory";
    }
  }

  private broadcastState() {
    this.socket.emit("gameStateUpdate", this.state);
  }
}