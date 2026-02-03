import { useState, useEffect, useRef } from "react";
import type { FieldUnit } from "@card-game/shared";

export const useUnitEffects = (unit: FieldUnit | null) => {
  const [damageText, setDamageText] = useState<{ id: number; text: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; color: string }[]>([]);
  const prevUnitRef = useRef<FieldUnit | null>(unit);
  const prevStackRef = useRef<number>(unit?.cardStack || 1);

  useEffect(() => {
    const prevUnit = prevUnitRef.current;
    
    // 유닛이 있고 체력이 감소한 경우
    if (unit && prevUnit && unit.id === prevUnit.id && unit.currentHp < prevUnit.currentHp) {
      const damage = prevUnit.currentHp - unit.currentHp;
      triggerDamageEffect(damage);
      triggerShake();
    }
    // 유닛이 파괴된 경우 (이전에는 있었는데 지금은 null)
    else if (!unit && prevUnit) {
      triggerDamageEffect(prevUnit.currentHp);
    }

    // 유닛이 공격을 수행한 경우 (공격 모션 효과)
    if (unit && prevUnit && unit.id === prevUnit.id && !prevUnit.hasAttacked && unit.hasAttacked) {
      triggerShake();
    }

    // 병합(레벨업) 감지: 같은 유닛 ID인데 스택이 증가한 경우
    if (unit && prevUnit && unit.id === prevUnit.id) {
      if (unit.cardStack > prevStackRef.current) {
        triggerLevelUp();
      }

      // 스탯 증가 감지 (병합 시)
      const atkDiff = unit.attackPower - prevUnit.attackPower;
      const hpDiff = unit.maxHp - prevUnit.maxHp;

      if (atkDiff > 0) {
        addFloatingText(`+${atkDiff} ATK`, "#e67e22"); // 주황색
      }
      if (hpDiff > 0) {
        // 겹치지 않게 약간의 시간차를 두고 표시
        setTimeout(() => addFloatingText(`+${hpDiff} HP`, "#2ecc71"), 300); // 초록색
      }
    }

    prevUnitRef.current = unit;
    if (unit) prevStackRef.current = unit.cardStack;
  }, [unit]);

  const triggerDamageEffect = (amount: number) => {
    setDamageText({ id: Date.now(), text: `-${amount}` });
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
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  return { damageText, isShaking, isLevelUp, floatingTexts };
};