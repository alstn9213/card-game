import type { Entity, FieldUnit, GameCard } from "./interfaces";

export type GameStatus = "playing" | "victory" | "defeat";

// 필드의 슬롯을 5개로 고정
export type Field = [FieldUnit | null, FieldUnit | null, FieldUnit | null, FieldUnit | null, FieldUnit | null];

// 서버와 클라이언트가 공유하는 실시간 게임 상태
export interface GameState {
  player: Entity;
  enemy: FieldUnit;
    
  playerField: Field; 
  enemyField: Field;

  // 카드 관련 상태
  hand: GameCard[];
  deck: GameCard[];
  discardPile: GameCard[];
  
  // 코스트(금화) 및 턴 관리
  currentGold: number;
  turn: number;
  isPlayerTurn: boolean;
  
  // 게임 종료 여부
  gameStatus: GameStatus;
}
