import { ClientToServerEvents, ServerToClientEvents, validateDeck, ClientEvents, ServerEvents, ErrorCode, GameStatus } from "@card-game/shared";
import { Socket } from "socket.io";
import { GameLogic } from "./GameLogic";
import { createError } from "./GameErrors";
import { GameLoopManager } from "./GameLoopManager";


export class GameSession {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private gameLogic: GameLogic | null = null;
  private gameLoopManager: GameLoopManager;

  constructor(socket: Socket) {
    this.socket = socket;    
    this.gameLoopManager = new GameLoopManager(
      () => this.gameLogic,
      () => this.broadcastState()
    );
    this.setupListeners();
  }

  // 게임 상태 getter 메서드
  public getGameState() {
    return this.gameLogic?.getState();
  }

  // 게임 시작 메서드
  public startGame(playerDeck: string[]) {
    // 이전 게임의 타이머가 남아있을 수 있으므로 정리
    this.gameLogic?.onDisconnect();
    this.gameLoopManager.clearTimers();
    
    if (playerDeck && playerDeck.length > 0) {
      validateDeck(playerDeck);
    }

    this.gameLogic = new GameLogic(playerDeck);
    this.broadcastState();
  }

  // --- 헬퍼 메서드 ---
  
  private setupListeners() {
    this.socket.on(ClientEvents.JOIN_GAME, (deck: string[]) => {
      try {
        this.startGame(deck);
      } catch (err: any) {
        const error = err.code ? err : createError(ErrorCode.UNKNOWN_ERROR);
        this.socket.emit(ServerEvents.ERROR, error);
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
      this.gameLoopManager.clearTimers();
      this.gameLogic?.onDisconnect();
      this.gameLogic = null;
    });
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
      // 동기적인 액션(카드 내기, 공격) 후에는 즉시 상태를 전파.
      if (!skipBroadcast) {
        this.broadcastState();
      }
    } catch (error: any) {
      // 의도된 게임 에러인 경우 그대로 전달
      if (error.code) {
        this.socket.emit(ServerEvents.ERROR, error);
      } else {
        // 예상치 못한 에러인 경우 서버 로그에 남기고, 클라이언트에는 실패 코드로 전달
        console.error(`[GameAction Error] ${failCode}:`, error);
        this.socket.emit(ServerEvents.ERROR, createError(failCode));
      }
    }
  }

  private validateGameLogic(): GameLogic | null {
    if (!this.gameLogic) {
      this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.GAME_NOT_STARTED));
      return null;
    }
    return this.gameLogic;
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
      ErrorCode.UNKNOWN_ERROR
    );
  }

  private handleBuyCard(cardIndex: number) {
    this.executeGameAction(
      (logic) => logic.buyCard(cardIndex),
      ErrorCode.UNKNOWN_ERROR
    );
  }

  private handleEndTurn() {
    this.executeGameAction((logic) => {
      // 플레이어 턴이 아닐 때 요청이 오면 에러 발생 -> executeGameAction의 catch에서 처리됨
      if (!logic.getState().isPlayerTurn) {
        throw createError(ErrorCode.NOT_YOUR_TURN);
      }
      logic.endTurn();
    }, ErrorCode.UNKNOWN_ERROR);

    this.gameLoopManager.startEnemyTurnSequence();
  }

  private broadcastState() {
    if (!this.gameLogic) {
      return;
    }
    this.socket.emit(ServerEvents.GAME_STATE_UPDATE, this.gameLogic.getState());
  }
}