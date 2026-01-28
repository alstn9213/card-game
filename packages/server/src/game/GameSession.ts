import { ClientToServerEvents, ServerToClientEvents, validateDeck, ClientEvents, ServerEvents, ErrorCode } from "@card-game/shared";
import { Socket } from "socket.io";
import { GameLogic } from "./GameLogic";
import { createError } from "./GameErrors";


export class GameSession {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private gameLogic: GameLogic | null = null;

  constructor(socket: Socket) {
    this.socket = socket;    
    this.setupListeners();
  }

  public getGameState() {
    return this.gameLogic?.getState();
  }

  public startGame(playerDeck: string[]) {
    // 이전 게임의 타이머가 남아있을 수 있으므로 정리
    this.gameLogic?.onDisconnect();
    if (playerDeck && playerDeck.length > 0) {
      validateDeck(playerDeck);
    }
    this.gameLogic = new GameLogic(playerDeck, () => this.broadcastState());
    this.broadcastState();
  }

  // --- 헬퍼 메서드 ---
  
  private validateGameLogic(): GameLogic | null {
    if (!this.gameLogic) {
      this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.GAME_NOT_STARTED));
      return null;
    }
    return this.gameLogic;
  }

  // 반복되는 액션 실행 및 에러 처리 로직을 공통화
  private executeGameAction(
    action: (gameLogic: GameLogic) => void,
    failCode: ErrorCode,
    skipBroadcast: boolean = false
  ) {
    const gameLogic = this.validateGameLogic();
    if (!gameLogic) return;

    try {
      action(gameLogic);
      // 동기적인 액션(카드 내기, 공격) 후에는 즉시 상태를 전파합니다.
      // 비동기적인 endTurn은 TurnManager가 직접 전파를 처리합니다.
      if (!skipBroadcast && action.name !== 'endTurn') {
        this.broadcastState();
      }
    } catch (error: any) {
      // GameError 객체인지 확인 (code 속성 존재 여부 등), 아니면 기본 에러 생성
      const gameError = error.code ? error : createError(failCode, error.message);
      this.socket.emit(ServerEvents.ERROR, gameError);
    }
  }

  private setupListeners() {
    this.socket.on(ClientEvents.JOIN_GAME, (deck: string[]) => {
      try {
        this.startGame(deck);
      } catch (err: any) {
        this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.UNKNOWN_ERROR, err.message));
      }
    });

    this.socket.on(ClientEvents.PLAY_CARD, (cardIndex: number) => {
      this.handlePlayCard(cardIndex);
    });

    this.socket.on(ClientEvents.END_TURN, () => {
      this.handleEndTurn();
    });

    this.socket.on(ClientEvents.ATTACK, (attackerId: string, targetId: string) => {
      this.handleAttack(attackerId, targetId);
    });

    this.socket.on(ClientEvents.ACTIVATE_ABILITY, (cardInstanceId: string, abilityIndex: number, targetId?: string) => {
      this.handleActivateAbility(cardInstanceId, abilityIndex, targetId);
    });

    this.socket.on(ClientEvents.CONTINUE_ROUND, () => {
      this.handleContinueRound();
    });

    this.socket.on(ClientEvents.BUY_CARD, (cardIndex: number) => {
      this.handleBuyCard(cardIndex);
    });

    this.socket.on("disconnect", () => {
      this.gameLogic?.onDisconnect();
      this.gameLogic = null;
    });
  }

  private handleActivateAbility(cardInstanceId: string, abilityIndex: number, targetId?: string) {
    this.executeGameAction((logic) => {
      logic.activateAbility(cardInstanceId, abilityIndex, targetId);
    }, ErrorCode.ABILITY_USE_FAILED);
  }

  private handlePlayCard(cardIndex: number) {
    this.executeGameAction(
      (logic) => logic.playCard(cardIndex),
      ErrorCode.PLAY_CARD_FAILED
    );
  }

  private handleAttack(attackerId: string, targetId: string) {
    this.executeGameAction(
      (logic) => logic.attack(attackerId, targetId),
      ErrorCode.ATTACK_FAILED
    );
  }

  private handleContinueRound() {
    this.executeGameAction(
      (logic) => logic.continueRound(),
      ErrorCode.UNKNOWN_ERROR,
      true // TurnManager.startNextRound에서 이미 broadcast를 호출하므로 중복 전송 방지
    );
  }

  private handleBuyCard(cardIndex: number) {
    this.executeGameAction(
      (logic) => logic.buyCard(cardIndex),
      ErrorCode.UNKNOWN_ERROR
    );
  }

  private handleEndTurn() {
    const gameLogic = this.validateGameLogic();
    if (!gameLogic) return;
    
    // 플레이어 턴이 아닐 때 요청이 오면 무시
    if (!gameLogic.getState().isPlayerTurn) {
      this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.NOT_YOUR_TURN));
      return;
    }

    gameLogic.endTurn();
  }

  private broadcastState() {
    if (!this.gameLogic) return;
    this.socket.emit(ServerEvents.GAME_STATE_UPDATE, this.gameLogic.getState());
  }
}