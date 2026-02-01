import { CardType, EffectType, TargetType, GameStatus } from "./types";

// 플레이어의 상태
export interface Entity {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
}

// 카드 데이터 구조
export interface CardData {
  cardId: string; // 예: "unit_slime" (데이터 ID)
  name: string;
  cost: number;
  description: string;
  type: CardType;
  targetType: TargetType;
}

// 게임 내에 존재하는 카드 (덱, 핸드, 무덤)
export interface GameCard extends CardData {
  id: string;  // 예: "uuid-v4-..." (이 카드의 고유 번호)
  ownerId?: string;     // 누구 소유인지
  
}

// 몬스터 카드
export interface UnitCard extends CardData {
  attackPower: number;
  maxHp: number;
  abilities?: Ability;
}


// 전장에 소환된 카드
export interface FieldUnit extends GameCard, UnitCard {
  currentHp: number;
  hasAttacked: boolean;
  
}

export interface Ability {
  type: EffectType;
  description: string;
  targetType: TargetType;
  value?: number;          // 데미지나 회복량 등 수치 (선택)
  targetId?: string;       // 변신할 대상의 ID 등 (선택)
}

// 마법 카드
export interface SpellCard extends CardData {
  effectType: EffectType;
  value?: number;          // 데미지나 회복량 등 수치 (선택)
  targetId?: string; 
}


export interface AttackLog {
  attackerId: string;
  targetId: string;
  damage: number;
}

export interface GameState {
  gameStatus: GameStatus;
  turn: number;
  round: number;
  isPlayerTurn: boolean;
  player: Entity;
  playerField: (FieldUnit | null)[];
  enemyField: (FieldUnit | null)[];
  hand: GameCard[];
  deck: GameCard[];
  discardPile: GameCard[];
  currentGold: number;
  shopItems: UnitCard[];        // 상점에서 판매 중인 카드 목록
  currentRoundEnemies: UnitCard[]; // 현재 라운드에 등장한 적 목록 (라운드 종료 후 상점 등록용)
  attackLogs: AttackLog[];      // 이번 턴(또는 액션)에 발생한 공격 로그
}
