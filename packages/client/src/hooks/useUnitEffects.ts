import { useState, useEffect, useRef } from "react";
import type { FieldUnit } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';

export const useUnitEffects = (unit: FieldUnit | null) => {
  const [damageText, setDamageText] = useState<{ id: string; text: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; text: string; color: string }[]>([]);
  const prevUnitRef = useRef<FieldUnit | null>(unit);
  const prevStackRef = useRef<number>(unit?.cardStack || 1);

  const unitId = unit?.id;
  const currentHp = unit?.currentHp;
  const hasAttacked = unit?.hasAttacked;
  const cardStack = unit?.cardStack;
  const attackPower = unit?.attackPower;
  const maxHp = unit?.maxHp;

  const triggerDamageEffect = (amount: number) => {
    setDamageText({ id: uuidv4(), text: `-${amount}` });
    setTimeout(() => setDamageText(null), 1000);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const triggerLevelUp = () => {
    setIsLevelUp(true);
    setTimeout(() => setIsLevelUp(false), 1500);
  };

  const addFloatingText = (text: string, color: string) => {
    const id = uuidv4();
    setFloatingTexts(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  // 상태 변화 감지 로직 분리
  const checkCombatStatus = (prev: FieldUnit, current: FieldUnit) => {
    // 체력 감소 (피격)
    if (current.currentHp < prev.currentHp) {
      triggerDamageEffect(prev.currentHp - current.currentHp);
      triggerShake();
    }
    // 공격 수행 (공격 모션)
    if (!prev.hasAttacked && current.hasAttacked) {
      triggerShake();
    }
  };

  const checkStatChanges = (prev: FieldUnit, current: FieldUnit) => {
    const atkDiff = current.attackPower - prev.attackPower;
    const hpDiff = current.maxHp - prev.maxHp;

    if (atkDiff > 0) {
      addFloatingText(`+${atkDiff} ATK`, "#e67e22");
    } else if (hpDiff > 0) {
      setTimeout(() => addFloatingText(`+${hpDiff} HP`, "#2ecc71"), 300);
    }
  };

  useEffect(() => {
    const prevUnit = prevUnitRef.current;

    if (unit && prevUnit && unit.id === prevUnit.id) {
      checkCombatStatus(prevUnit, unit);
      checkStatChanges(prevUnit, unit);
      
      if (unit.cardStack > prevStackRef.current) {
        triggerLevelUp();
      }
    } 
    
    else if (!unit && prevUnit) {
      // 유닛이 사라질 때 체력이 남아있던 경우에만 데미지 표시 (이미 죽은 유닛 제외)
      if (prevUnit.currentHp > 0) {
        triggerDamageEffect(prevUnit.currentHp);
      }
    }

    prevUnitRef.current = unit;
    
    if (unit) {
      prevStackRef.current = unit.cardStack;
    }
  }, [unitId, currentHp, hasAttacked, cardStack, attackPower, maxHp]);

  return { 
    damageText, 
    isShaking, 
    isLevelUp, 
    floatingTexts 
  };
};