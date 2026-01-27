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
    validateDeck(playerDeck);
    this.gameLogic = new GameLogic(playerDeck);
    this.broadcastState();
  }

  // --- 헬퍼 메서드 ---
  
  // 반복되는 액션 실행 및 에러 처리 로직을 공통화
  private executeGameAction(
    action: (gameLogic: GameLogic) => void,
    failCode: ErrorCode
  ) {
    if (!this.gameLogic) {
      this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.GAME_NOT_STARTED));
      return;
    }

    try {
      action(this.gameLogic);
      this.broadcastState();
    } catch (error: any) {
      // GameError 객체인지 확인 (code 속성 존재 여부 등), 아니면 기본 에러 생성
      const gameError = error.code ? error : createError(failCode, error.message);
      this.socket.emit(ServerEvents.ERROR, gameError);
    }
  }

  private handleActivateAbility(cardInstanceId: string, abilityIndex: number, targetId?: string) {
    this.executeGameAction((logic) => {
      const state = logic.getState();
      const playerId = state.player.id;
      logic.getAbilityManager().executeAbility(state, playerId, cardInstanceId, abilityIndex, targetId);
    }, ErrorCode.ABILITY_USE_FAILED);
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

    this.socket.on("disconnect", () => {
      console.log(`Client disconnected: ${this.socket.id}`);
      this.gameLogic = null;
    });
  }

  private handlePlayCard(cardIndex: number) {
    this.executeGameAction(
      (logic) => logic.getPlayerManager().playCard(cardIndex),
      ErrorCode.PLAY_CARD_FAILED
    );
  }

  private handleAttack(attackerId: string, targetId: string) {
    this.executeGameAction(
      (logic) => logic.getPlayerManager().attack(attackerId, targetId),
      ErrorCode.ATTACK_FAILED
    );
  }

  private handleEndTurn() {
    if (!this.gameLogic) {
      this.socket.emit(ServerEvents.ERROR, createError(ErrorCode.GAME_NOT_STARTED));
      return;
    }
    this.gameLogic.getTurnManager().endTurn();
    this.broadcastState();

    // 적의 턴 진행 (약간의 지연 효과)
    setTimeout(() => {
      if (!this.gameLogic) return;
      this.gameLogic.getTurnManager().processEnemyTurn();
      this.broadcastState();
    }, 1000);
  }
  

  private broadcastState() {
    if (!this.gameLogic) return;
    this.socket.emit(ServerEvents.GAME_STATE_UPDATE, this.gameLogic.getState());
  }
}