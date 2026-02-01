import { ClientToServerEvents, ServerToClientEvents, validateDeck, ClientEvents, ServerEvents, ErrorCode, createError, GameState } from "@card-game/shared";
import { Socket } from "socket.io";
import { GameLoopManager } from "./GameLoopManager";
import { ErrorHandler } from "./ErrorHandler";
import { createGameContext, GameContext } from "./GameContextFactory";

export class GameSession {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private gameContext: GameContext | null = null;
  private gameLoopManager: GameLoopManager;
  private errorHandler: ErrorHandler;

  constructor(socket: Socket) {
    this.socket = socket;
    this.errorHandler = new ErrorHandler(this.socket);
    this.gameLoopManager = new GameLoopManager(
      () => this.gameContext?.turnManager ?? null,
      () => this.gameContext?.state ?? null,
      () => this.broadcastState()
    );
    this.setupListeners();
  }

  // --- 헬퍼 메서드 ---
  
  private setupListeners() {
    this.socket.on(ClientEvents.JOIN_GAME, (deck: string[]) => {
      try {
        this.startGame(deck);
      } catch (err: unknown) {
        this.errorHandler.handleError(err, ErrorCode.UNKNOWN_ERROR);
      }
    });

    this.socket.on(ClientEvents.PLAY_CARD, (cardIndex: number, targetId?: string) => {
      this.handlePlayCard(cardIndex, targetId);
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
      this.gameContext = null;
    });
  }

  // 게임 시작 헬퍼 메서드
  private startGame(playerDeck: string[]) {
    // 이전 게임의 타이머가 남아있을 수 있으므로 정리
    this.gameLoopManager.clearTimers();
    
    if (playerDeck && playerDeck.length > 0) {
      validateDeck(playerDeck);
    }

    this.gameContext = createGameContext(playerDeck);
    this.broadcastState();
  }

  // 반복되는 액션 실행 및 에러 처리 로직을 공통화
  private executeGameAction(
    action: (context: GameContext) => void
  ): boolean {
    const context = this.validateGameContext();
    if (!context) return false;

    try {
      action(context);      
      context.turnManager.checkGameOver();
      this.broadcastState();
      return true;  
    } 
    catch (error: unknown) {
      this.errorHandler.handleError(error, ErrorCode.UNKNOWN_ERROR);
      return false;
    }
  }

  private validateGameContext(): GameContext | null {
    if (!this.gameContext) {
      this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.GAME_NOT_STARTED));
      return null;
    }
    return this.gameContext;
  }


  private handleActivateAbility(cardInstanceId: string, abilityIndex: number, targetId?: string) {
    this.executeGameAction((context) => {
      context.abilityManager.executeAbility(context.state, context.state.player.id, cardInstanceId, abilityIndex, targetId);
    });
  }

  private handlePlayCard(cardIndex: number, targetId?: string) {
    this.executeGameAction(
      (context) => context.playerManager.playCard(cardIndex, targetId)
    );
  }

  private handleAttack(attackerId: string, targetId: string) {
    this.executeGameAction(
      (context) => context.playerManager.attack(attackerId, targetId)
    );
  }

  private handleContinueRound() {
    this.executeGameAction(
      (context) => context.turnManager.startNextRound()
    );
  }

  private handleBuyCard(cardIndex: number) {
    this.executeGameAction(
      (context) => context.shopManager.buyCard(cardIndex)
    );
  }

  // 플레이어 턴이 끝나면 상대 로직 실행
  private handleEndTurn() {
    const success = this.executeGameAction(
      (context) => context.turnManager.endTurn()
    );

    if (success) {
      this.gameLoopManager.startEnemyTurnSequence();
    }
  }

  private broadcastState() {
    if (!this.gameContext) {
      console.warn("[GameSession] broadcastState called without gameContext");
      return;
    }
    this.socket.emit(ServerEvents.GAME_STATE_UPDATE, this.gameContext.state);
  }
}