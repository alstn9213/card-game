import { GameState, GameStatus, UNIT_CARDS, DeckRules, UnitCard, GameCard, validateDeck, FieldUnit } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { GameUtils } from "./utils/GameUtils";

export const createInitialGameState = (): GameState => {
  // 5개의 슬롯을 가진 빈 필드 정의 (null로 초기화)
  const emptyField: FieldUnit[] = [null, null, null, null, null];

  return {
    player: {
      id: uuidv4(),
      name: "Player",
      maxHp: 4000,
      currentHp: 4000,
    },
        
    playerField: [...emptyField],
    enemyField: [...emptyField],

    hand: [],
    deck: [],
    discardPile: [],
    
    currentGold: 5,
    turn: 1,
    round: 1,
    isPlayerTurn: true,
    
    gameStatus: GameStatus.PLAYING,
  };
};

export const initializeGame = (playerDeck?: string[]): GameState => {
  const state = createInitialGameState();
  
  let deckCardIds: string[] = [];

  //  덱이 없으면 기본 덱을 생성하는 로직 추가
  if (playerDeck && playerDeck.length > 0) {
    validateDeck(playerDeck);
    deckCardIds = playerDeck;
  } else {
    deckCardIds = generateDefaultDeck();
  }

  // ID 목록을 실제 게임 카드 인스턴스로 변환
  const rawDeck = initializeDeck(deckCardIds, state.player.id);
  const deck = GameUtils.shuffleArray(rawDeck);

  // 핸드 드로우 (5장)
  const hand = deck.splice(0, 5);

  // 생성된 상태에 덱과 핸드 정보 업데이트
  state.deck = deck;
  state.hand = hand;

  return state;
};

// 기본 덱 생성 (랜덤하게 20장 채우기)
const generateDefaultDeck = (): string[] => {
  const deckIds: string[] = [];
  const availableCards = Object.values(UNIT_CARDS); 

  if (availableCards.length === 0) return [];

  while (deckIds.length < DeckRules.MIN_DECK_SIZE) {
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    
    // 현재 덱에 포함된 해당 카드의 개수 확인
    const currentCount = deckIds.filter(id => id === randomCard.cardId).length;

    // 최대 매수 제한(3장)을 넘지 않으면 추가
    if (currentCount < DeckRules.MAX_COPIES_PER_CARD) {
      deckIds.push(randomCard.cardId);
    }
  }

  return deckIds;
};

// 게임 시작 시 덱 초기화 함수
const initializeDeck = (deckCardIds: string[], playerId: string): GameCard[] => {
  return deckCardIds.map((cardId) => {
    const originalData = Object.values(UNIT_CARDS).find((c: UnitCard) => c.cardId === cardId);
    
    if (!originalData) throw new Error(`Card not found: ${cardId}`);

    const gameCard: GameCard = {
      ...originalData,        // 기본 스탯 복사
      id: uuidv4(),   // 이 카드만의 고유 번호
      cardId: cardId,     // 원본 데이터 ID
      ownerId: playerId
    };

    return gameCard;
  });
};