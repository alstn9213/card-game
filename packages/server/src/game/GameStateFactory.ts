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
    // 임시 적 상태
    enemy: {
      id: "enemy-hero",
      cardId: "boss_01",
      name: "Enemy Boss",
      cost: 0,
      description: "Final Boss",
      type: CardType.UNIT,
      targetType: TargetType.SINGLE_ENEMY,
      attackPower: 0,
      maxHp: 4000,
      currentHp: 4000,
      hasAttacked: false,
    },
    
    // 배열 확산 연산자(...)를 사용하면 튜플 타입이 일반 배열로 추론될 수 있으므로 타입 단언(as Field) 사용
    playerField: [...emptyField] as Field,
    enemyField: [...emptyField] as Field,

    hand: [],
    deck: [], // 덱은 별도 로직(DeckManager 등)으로 채워야 함
    discardPile: [],
    
    currentGold: 5,
    turn: 1,
    isPlayerTurn: true,
    
    gameStatus: "playing",
  };
};