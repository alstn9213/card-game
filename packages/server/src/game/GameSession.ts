import { ClientToServerEvents, ServerToClientEvents, ClientEvents, ServerEvents, ErrorCode, createError, CardType, FieldUnit, GameCard, GameError } from "@card-game/shared";
import { Socket } from "socket.io";
import { GameLoopManager } from "./GameLoopManager";
import { ErrorHandler } from "./ErrorHandler";
import { createGameContext, GameContext } from "./GameContextFactory";
import { GameActionManager } from "./GameActionManager";

export class GameSession {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private gameContext: GameContext | null = null;
  private gameLoopManager: GameLoopManager;
  private gameActionManager: GameActionManager;

  constructor(socket: Socket) {
    this.socket = socket;
    
    const errorHandler = (error: unknown, code: ErrorCode, context: string) => 
      ErrorHandler.handleError(this.socket, error, code, context);

    this.gameLoopManager = new GameLoopManager(
      () => this.gameContext,
      () => this.broadcastState(),
      errorHandler
    );

    this.gameActionManager = new GameActionManager(
      () => this.gameContext,
      () => this.broadcastState(),
      errorHandler
    );

    this.setupListeners();
  }

  // --- 헬퍼 메서드 ---

  // 게임 상태 최신화 헬퍼
  private broadcastState() {
    const context = this.validateGameContext();
    this.socket.emit(ServerEvents.GAME_STATE_UPDATE, context.state);
  }
  
  // 소켓 전파 헬퍼
  private setupListeners() {
    this.socket.on(ClientEvents.JOIN_GAME, (deck: string[]) => {
      this.handleStartGame(deck);
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

    this.socket.on(ClientEvents.CONTINUE_ROUND, () => {
      this.handleContinueRound();
    });

    this.socket.on(ClientEvents.BUY_CARD, (cardIndex: number) => {
      this.handleBuyCard(cardIndex);
    });

    this.socket.on(ClientEvents.MERGE_FIELD_UNITS, (sourceId: string, targetId: string) => {
      this.handleMergeFieldUnits(sourceId, targetId);
    });

    this.socket.on(ClientEvents.ENTER_SHOP, () => {
      this.handleEnterShop();
    });

    this.socket.on("disconnect", () => {
      this.gameLoopManager.clearTimers();
      this.gameContext = null;
    });
  }

  // 게임 시작 헬퍼
  private handleStartGame(playerDeck: string[]) {
    try {
      // 이전 게임의 타이머가 남아있을 수 있으므로 정리
      this.gameLoopManager.clearTimers();
      this.gameContext = createGameContext(playerDeck);
      
      const isSuccess = this.gameActionManager.execute((context) => {
        context.enemyManager.spawnEnemies();
        context.turnManager.endEnemyTurn();
      }, "GameSession: StartGame");

      // 초기화 로직(적 소환 등) 실패 시 생성된 불완전한 게임 컨텍스트 파기
      if (!isSuccess) {
        this.gameContext = null;
      }
    } 
    
    catch (err: unknown) {
      this.gameContext = null;
      ErrorHandler.handleError(this.socket, err, ErrorCode.UNKNOWN_ERROR, "GameSession: StartGame");
    }
  }

  
  // 카드소환 및 병합 핸들러
  private handlePlayCard(cardIndex: number, targetId?: string) {
    let mergedUnit: FieldUnit | undefined;
    let playedCard: GameCard | null = null;

    this.gameActionManager.execute((context) => {
      const state = context.state;
      const card = state.hand[cardIndex];

      if (!card) {
        console.warn("[GameSession] card가 없습니다.");
        return;
      }

      // [패 -> 필드 병합 로직]
      if (card.type === CardType.UNIT && targetId) {
        mergedUnit = context.playerManager.mergeHandCard(cardIndex, targetId);
      } 
      
      // [일반 카드 플레이 로직]
      else {
        playedCard = context.playerManager.playCard(cardIndex, targetId);
      }
    }, "GameSession: PlayCard");

    if (mergedUnit) {
      this.socket.emit(ServerEvents.MERGE_SUCCESS, {
        unitId: mergedUnit.id,
        level: mergedUnit.cardStack
      });
    }

    if (playedCard && playedCard.type === CardType.SPELL) {
      this.socket.emit(ServerEvents.SPELL_CAST, {
        cardId: playedCard.cardId,
        targetId: targetId
      });
    }
  }

  // 플레이어의 상대 공격 핸들러
  private handleAttack(attackerId: string, targetId: string) {
    this.gameActionManager.execute(
      (context) => context.playerManager.attack(attackerId, targetId),
      "GameSession: Attack"
    );
  }

   // 플레이어 턴이 끝나면 상대 로직 실행 핸들러
  private handleEndTurn() {
    const success = this.gameActionManager.execute(
      (context) => context.turnManager.endPlayerTurn(),
      "GameSession: EndTurn"
    );

    if (success) {
      this.gameLoopManager.startEnemyTurnSequence();
    }
  }

  // 상점에서 카드 구매 핸들러  
  private handleBuyCard(cardIndex: number) {
    this.gameActionManager.execute(
      (context) => context.shopManager.buyCard(cardIndex),
      "GameSession: BuyCard"
    );
  }

  // 다음 라운드 진행 핸들러
  private handleContinueRound() {
    this.gameActionManager.execute(
      (context) => {
        context.turnManager.startNextRound();
        context.enemyManager.spawnEnemies();
        context.turnManager.endEnemyTurn();
      },
      "GameSession: ContinueRound"
    );
  }

  // 필드에서 카드 병합 핸들러
  private handleMergeFieldUnits(sourceId: string, targetId: string) {
    let mergedUnit: FieldUnit | undefined;

    this.gameActionManager.execute(
      (context) => {
        mergedUnit = context.playerManager.mergeFieldUnits(sourceId, targetId);
      },
      "GameSession: MergeFieldUnits"
    );

    if (mergedUnit) {
      this.socket.emit(ServerEvents.MERGE_SUCCESS, {
        unitId: mergedUnit.id,
        level: mergedUnit.cardStack
      });
    }
  }

  // 상점 진입 핸들러
  private handleEnterShop() {
    this.gameActionManager.execute(
      (context) => context.turnManager.enterShop(),
      "GameSession: EnterShop"
    );
  }

  
  // 매니저 반환 및 유효성 검사 헬퍼
  private validateGameContext(): GameContext {
    if (!this.gameContext) {
      throw createError(ErrorCode.GAME_NOT_STARTED);
    }
    return this.gameContext;
  }

 
}