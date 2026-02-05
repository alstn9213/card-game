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

  useEffect(() => {
    const prevUnit = prevUnitRef.current;
    
    // 유닛이 계속 존재하는 경우 (ID가 같음)
    if (unit && prevUnit && unit.id === prevUnit.id) {
      // 체력 감소 (피격)
      if (unit.currentHp < prevUnit.currentHp) {
        const damage = prevUnit.currentHp - unit.currentHp;
        triggerDamageEffect(damage);
        triggerShake();
      }

      // 공격 수행 (공격 모션)
      if (!prevUnit.hasAttacked && unit.hasAttacked) {
        triggerShake();
      }

      // 병합 감지
      if (unit.cardStack > prevStackRef.current) {
        triggerLevelUp();
      }

      // 스탯 증가 감지
      const atkDiff = unit.attackPower - prevUnit.attackPower;
      const hpDiff = unit.maxHp - prevUnit.maxHp;

      if (atkDiff > 0) {
        addFloatingText(`+${atkDiff} ATK`, "#e67e22"); // 주황색
      }
      
      else if (hpDiff > 0) {
        setTimeout(() => addFloatingText(`+${hpDiff} HP`, "#2ecc71"), 300); // 초록색
      }
    }
    // 유닛이 파괴된 경우 (이전에는 있었는데 지금은 null)
    else if (!unit && prevUnit) {
      triggerDamageEffect(prevUnit.currentHp);
    }

    prevUnitRef.current = unit;
    
    if (unit) {
      prevStackRef.current = unit.cardStack;
    }
  }, [unitId, currentHp, hasAttacked, cardStack, attackPower, maxHp]);

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

  return { 
    damageText, 
    isShaking, 
    isLevelUp, 
    floatingTexts 
  };
};