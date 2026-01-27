import { CardType, Field, GameState, TargetType } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';

export const createInitialGameState = (): GameState => {
  // 5개의 슬롯을 가진 빈 필드 정의 (null로 초기화)
  const emptyField: Field = [null, null, null, null, null];

  return {
    player: {
      id: uuidv4(),
      name: "Player",
      maxHp: 4000,
      currentHp: 4000,
    },
    
    
    // 배열 확산 연산자(...)를 사용하면 튜플 타입이 일반 배열로 추론될 수 있으므로 타입 단언(as Field) 사용
    playerField: [...emptyField] as Field,
    enemyField: [...emptyField] as Field,

    hand: [],
    deck: [],
    discardPile: [],
    
    currentGold: 5,
    turn: 1,
    round: 1,
    isPlayerTurn: true,
    
    gameStatus: "playing",
  };
};