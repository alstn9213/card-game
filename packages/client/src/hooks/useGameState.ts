import { useState, useCallback, useEffect } from "react";
import { createStarterDeck } from "@card-game/shared/src/data/deckPreset";
import { CardType, TargetType } from "@card-game/shared/src/enums";
import type { Card, SpellCard, UnitCard } from "@card-game/shared";

// 게임 내 엔티티(플레이어/적) 상태
interface EntityState {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
}

// 전장에 나와있는 유닛 (기본 유닛 정보 + 현재 상태)
export interface FieldUnit extends UnitCard {
  instanceId: string; // 고유 ID (같은 카드가 2장일 때 구분을 위해)
  currentHp: number;
  canAttack: boolean;
}

export const useGameState = () => {
  const [player, setPlayer] = useState<EntityState>({ hp: 4000, maxHp: 4000, mana: 3, maxMana: 3 });
  const [enemy, setEnemy] = useState<EntityState>({ hp: 2000, maxHp: 2000, mana: 3, maxMana: 3 }); // 임시 적
  
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [playerField, setPlayerField] = useState<FieldUnit[]>([]);
  const [enemyField, setEnemyField] = useState<FieldUnit[]>([]);
  const [turn, setTurn] = useState<"PLAYER" | "ENEMY">("PLAYER");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  // 2. 게임 초기화
  const initializeGame = useCallback(() => {
    const starterDeck = createStarterDeck();
    // 덱 셔플 로직 (간단 구현)
    const shuffled = [...starterDeck.cards].sort(() => Math.random() - 0.5);
    
    setDeck(shuffled);
    setHand([]);
    setPlayerField([]); // 필드 초기화
    setEnemyField([]); // 필드 초기화
    setPlayer({ hp: 4000, maxHp: 4000, mana: 3, maxMana: 3 });
    setEnemy({ hp: 2000, maxHp: 2000, mana: 3, maxMana: 3 });
    setTurn("PLAYER");
    addLog("게임이 시작되었습니다!");
    
  }, []);

  

  // 3. 카드 드로우
  const drawCard = useCallback((count: number = 1) => {
    setDeck(currentDeck => {
      if (currentDeck.length === 0) {
        addLog("덱에 카드가 없습니다!");
        return currentDeck;
      }
      const newDeck = [...currentDeck];
      const drawnCards = newDeck.splice(0, count);
      
      setHand(currentHand => [...currentHand, ...drawnCards]);
      return newDeck;
    });
  }, []);

  // 4. 카드 사용 (핵심 로직)
  const playCard = useCallback((cardIndex: number) => {
    if (turn !== "PLAYER") {
      addLog("내 턴이 아닙니다.");
      return;
    }

    const card = hand[cardIndex];
    if (player.mana < card.cost) {
      addLog("마나가 부족합니다!");
      return;
    }

    // 마나 소모
    setPlayer(prev => ({ ...prev, mana: prev.mana - card.cost }));

    // 카드 효과 발동
    if (card.type === CardType.UNIT) {
        // ✨ 유닛 카드: 필드에 소환
        if (playerField.length >= 7) {
            addLog("필드가 가득 찼습니다!");
            return;
        }

        const unitCard = card as UnitCard;
        const newUnit: FieldUnit = {
            ...unitCard,
            instanceId: Math.random().toString(36).substr(2, 9),
            currentHp: unitCard.hp,
            canAttack: false // 소환 후유증 (돌진 기능이 없다면)
        };

        setPlayerField(prev => [...prev, newUnit]);
        addLog(`${unitCard.name} 소환!`);

    } else if (card.type === CardType.SPELL) {
      const spell = card as SpellCard;
      if (spell.target === TargetType.SINGLE_ENEMY) {
        const damage = spell.value || 0;
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
        addLog(`${spell.name} 발동! 적에게 ${damage} 피해.`);
      } else if (spell.target === TargetType.SELF) {
        const heal = spell.value || 0;
        setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + heal) }));
        addLog(`${spell.name} 발동! 체력 ${heal} 회복.`);
      }
    } 
    // 공통: 마나 소모 및 핸드에서 제거
    setPlayer(prev => ({ ...prev, mana: prev.mana - card.cost }));
    setHand(prev => prev.filter((_, idx) => idx !== cardIndex));

  }, [hand, player.mana, turn, playerField.length]);

  // 5. 턴 종료
  const endTurn = useCallback(() => {
    setTurn("ENEMY");
    addLog("턴 종료! 적의 턴입니다.");
    
    
    // 적의 행동 (간단한 AI)
    setTimeout(() => {
      // 1. 적이 필드에 유닛이 있다면 공격 (추후 구현)
      setPlayer(prev => ({ ...prev, hp: prev.hp - 100 })); // 단순 공격
      addLog("적이 본체를 공격했습니다! (100 피해)");
      
      // 다시 플레이어 턴
      setTurn("PLAYER");
      setPlayer(prev => ({ ...prev, mana: Math.min(10, prev.maxMana + 1) }));
      drawCard(1); // 턴 시작 시 1장 드로우
      // ✨ 내 유닛들의 공격 기회 초기화 (다음 턴 공격 가능)
      setPlayerField(prev => prev.map(unit => ({ ...unit, canAttack: true })));
      addLog("나의 턴! 카드 1장 드로우.");
    }, 1500);
  }, [drawCard]);

  // 초기 시작 시 드로우
  useEffect(() => {
    if (deck.length > 0 && hand.length === 0) {
      drawCard(5);
    }
  }, [deck, drawCard, hand.length]);

  return {
    gameState: { player, enemy, hand, deck, turn, log, playerField, enemyField },
    actions: { initializeGame, playCard, endTurn }
  };
};