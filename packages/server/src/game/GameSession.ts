import { ClientToServerEvents, ServerToClientEvents, UNIT_CARDS } from "@card-game/shared";
import { Socket } from "socket.io";
import { AbilityManager } from "./abilities/AbilityManager";
import { GameLogic } from "./GameLogic";


export class GameSession {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private abilityManager: AbilityManager;
  private gameLogic: GameLogic;

  constructor(socket: Socket) {
    this.socket = socket;
    this.gameLogic = new GameLogic();
    this.abilityManager = new AbilityManager();

    // 클라이언트에게 초기 상태 전송
    this.broadcastState();
    
    // 이벤트 리스너 등록
    this.setupListeners();
  }

  // 클라이언트가 능력을 사용하겠다고 요청했을 때 호출되는 함수
  public activateAbility(playerId: string, cardInstanceId: string, abilityIndex: number) {
    // 플레이어 확인
    const state = this.gameLogic.getState();
    if (state.player.id !== playerId) return;

    // 필드에 있는 해당 카드(유닛) 찾기
    const unitIndex = state.playerField.findIndex(u => u?.id === cardInstanceId);
    if (unitIndex === -1) {
      console.log("카드가 필드에 없습니다.");
      return;
    }
    
    const unitInstance = state.playerField[unitIndex]!;
    const cardData = UNIT_CARDS.find(c => c.id === unitInstance.cardId);
    
    // 카드 능력 유효성 검사
    if (!cardData?.abilities || !cardData.abilities[abilityIndex]) {
        console.log("유효하지 않은 능력입니다.");
        return;
    }

    const ability = cardData.abilities[abilityIndex];

    this.abilityManager.executeAbility(this, playerId, cardInstanceId, ability);

    // 변경된 상태를 모든 클라이언트에게 전송
    this.broadcastState();
  }

  public getGameState() {
      return this.gameLogic.getState();
  }

  private setupListeners() {
    this.socket.on("playCard", (cardIndex: number) => {
      this.handlePlayCard(cardIndex);
    });

    this.socket.on("endTurn", () => {
      this.handleEndTurn();
    });

    this.socket.on("attack", (attackerId: string, targetId: string) => {
      this.handleAttack(attackerId, targetId);
    });
  }

  private handlePlayCard(cardIndex: number) {
    const result = this.gameLogic.playCard(cardIndex);
    
    if (!result.success) {
      this.socket.emit("error", result.message || "카드 사용 실패");
      return;
    }

    this.broadcastState();
  }

  private handleAttack(attackerId: string, targetId: string) {
    const result = this.gameLogic.attack(attackerId, targetId);
    
    if (!result.success) {
      this.socket.emit("error", result.message || "공격 실패");
      return;
    }
    
    this.broadcastState();
  }

  private handleEndTurn() {
    this.gameLogic.endTurn();
    this.broadcastState();

    // 적의 턴 진행 (약간의 지연 효과)
    setTimeout(() => {
      this.gameLogic.processEnemyTurn();
      this.broadcastState();
    }, 1000);
  }
  

  private broadcastState() {
    this.socket.emit("gameStateUpdate", this.gameLogic.getState());
  }
}