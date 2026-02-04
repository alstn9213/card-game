import { GameState, GameStatus, UNIT_CARDS, SPELL_CARDS, DeckRules, GameCard, validateDeck, FieldUnit, ErrorCode, createError } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { GameUtils } from "./utils/GameUtils";

export const initializeGame = (playerDeck?: string[]): GameState => {
  const state = createInitialGameState();
  
  let deckCardIds: string[] = [];

  if (playerDeck && playerDeck.length > 0) {
    validateDeck(playerDeck);
    deckCardIds = playerDeck;
  } 
  
  else {
    deckCardIds = generateDefaultDeck();
  }

  // ID 목록을 실제 게임 카드 인스턴스로 변환
  const rawDeck = initializeDeck(deckCardIds, state.player.id);
  const deck = GameUtils.shuffleArray(rawDeck);
  const hand = deck.splice(0, 5);
  state.deck = deck;
  state.hand = hand;

  return state;
};

// --- 내부 메서드 ---

const createInitialGameState = (): GameState => {
  const emptyField: FieldUnit[] = [null, null, null, null, null];

  return {
    player: {
      id: uuidv4(),
      name: "Player",
      maxHp: 500,
      currentHp: 500,
    },
        
    playerField: [...emptyField],
    enemyField: [...emptyField],

    hand: [],
    deck: [],
    discardPile: [],
    exhaustPile: [],
    
    currentGold: 5,
    turn: 1,
    round: 1,
    isPlayerTurn: true,
    
    gameStatus: GameStatus.PLAYING,
    shopItems: [],
    currentRoundEnemies: [],
    attackLogs: [],
  };
};

// 기본 덱 생성 (랜덤하게 15장 채우기)
const generateDefaultDeck = (): string[] => {
  const deckIds: string[] = [];
  const availableCards = [...UNIT_CARDS, ...SPELL_CARDS];

  if (availableCards.length === 0) {
    console.log(`[GameStateFactory] 플레이어가 덱을 구성하지않아 기본 덱을 생성합니다.`)
    return [];
  }

  while (deckIds.length < DeckRules.MIN_DECK_SIZE) {
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    
    const currentCardCount = deckIds.filter(id => id === randomCard.cardId).length;

    if (currentCardCount < DeckRules.MAX_COPIES_PER_CARD) {
      deckIds.push(randomCard.cardId);
    }
  }

  return deckIds;
};

// 게임 시작 시 덱 초기화 함수
const initializeDeck = (deckCardIds: string[], playerId: string): GameCard[] => {
  const allCards = [...UNIT_CARDS, ...SPELL_CARDS];
  const cardMap = new Map(allCards.map(card => [card.cardId, card]));

  return deckCardIds.map((cardId) => {
    const originalData = cardMap.get(cardId);
    
    if (!originalData) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    const gameCard: GameCard = {
      ...originalData,        // 기본 스탯 복사
      id: uuidv4(),   // 이 카드만의 고유 번호
      cardId: cardId,     // 원본 데이터 ID
      ownerId: playerId
    };

    return gameCard;
  });
};