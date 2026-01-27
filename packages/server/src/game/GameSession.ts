import { ClientToServerEvents, ServerToClientEvents, validateDeck } from "@card-game/shared";
import { Socket } from "socket.io";
import { GameLogic } from "./GameLogic";


export class GameSession {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private gameLogic: GameLogic | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
    
    // 이벤트 리스너 등록
    this.setupListeners();
  }

  public getGameState() {
    return this.gameLogic?.getState();
  }

  public startGame(playerDeck: string[]) {
    const validation = validateDeck(playerDeck);

    if (!validation.isValid) {
      throw new Error(`게임 시작 실패: ${validation.message}`);
    }

    // 검증된 덱을 사용하여 새로운 게임 로직 인스턴스를 생성하고 상태를 전파합니다.
    this.gameLogic = new GameLogic(playerDeck);
    this.broadcastState();
}

  private handleActivateAbility(cardInstanceId: string, abilityIndex: number) {
    if (!this.gameLogic) return;
    
    // 현재 게임 세션의 플레이어 ID를 가져옴
    const playerId = this.gameLogic.getState().player.id;

    const result = this.gameLogic.activateAbility(playerId, cardInstanceId, abilityIndex);
    
    if (!result.success) {
        this.socket.emit("error", result.message || "능력 사용 실패");
        return;
    }

    // 변경된 상태를 모든 클라이언트에게 전송
    this.broadcastState();
  }


  private setupListeners() {
    this.socket.on("joinGame", (deck: string[]) => {
      try {
        this.startGame(deck);
      } catch (err: any) {
        this.socket.emit("error", err.message);
      }
    });

    this.socket.on("playCard", (cardIndex: number) => {
      this.handlePlayCard(cardIndex);
    });

    this.socket.on("endTurn", () => {
      this.handleEndTurn();
    });

    this.socket.on("attack", (attackerId: string, targetId: string) => {
      this.handleAttack(attackerId, targetId);
    });

    this.socket.on("activateAbility", (cardInstanceId: string, abilityIndex: number) => {
      this.handleActivateAbility(cardInstanceId, abilityIndex);
    });

    this.socket.on("disconnect", () => {
      console.log(`Client disconnected: ${this.socket.id}`);
      this.gameLogic = null;
    });
  }

  private handlePlayCard(cardIndex: number) {
    if (!this.gameLogic) return;
    const result = this.gameLogic.playCard(cardIndex);
    
    if (!result.success) {
      this.socket.emit("error", result.message || "카드 사용 실패");
      return;
    }

    this.broadcastState();
  }

  private handleAttack(attackerId: string, targetId: string) {
    if (!this.gameLogic) return;
    const result = this.gameLogic.attack(attackerId, targetId);
    
    if (!result.success) {
      this.socket.emit("error", result.message || "공격 실패");
      return;
    }
    
    this.broadcastState();
  }

  private handleEndTurn() {
    if (!this.gameLogic) return;
    this.gameLogic.endTurn();
    this.broadcastState();

    // 적의 턴 진행 (약간의 지연 효과)
    setTimeout(() => {
      if (!this.gameLogic) return;
      this.gameLogic.processEnemyTurn();
      this.broadcastState();
    }, 1000);
  }
  

  private broadcastState() {
    if (!this.gameLogic) return;
    this.socket.emit("gameStateUpdate", this.gameLogic.getState());
  }
}