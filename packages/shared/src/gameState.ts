import type { Card, Entity, FieldUnit } from "./interfaces";

export type GameStatus = "playing" | "victory" | "defeat";

// 서버와 클라이언트가 공유하는 실시간 게임 상태
export interface GameState {
  player: Entity;
  enemy: FieldUnit;
    
  playerField: (FieldUnit | null)[]; 
  enemyField: (FieldUnit | null)[];

  // 카드 관련 상태
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  
  // 코스트(금화) 및 턴 관리
  currentGold: number;
  turn: number;
  isPlayerTurn: boolean;
  
  // 게임 종료 여부
  gameStatus: GameStatus;
}
