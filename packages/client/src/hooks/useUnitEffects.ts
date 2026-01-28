import { useState, useEffect, useRef } from "react";
import type { FieldUnit } from "@card-game/shared";

export const useUnitEffects = (unit: FieldUnit | null) => {
  const [damageText, setDamageText] = useState<{ id: number; text: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const prevUnitRef = useRef<FieldUnit | null>(unit);

  useEffect(() => {
    const prevUnit = prevUnitRef.current;
    
    // 1. 유닛이 있고 체력이 감소한 경우
    if (unit && prevUnit && unit.id === prevUnit.id && unit.currentHp < prevUnit.currentHp) {
      const damage = prevUnit.currentHp - unit.currentHp;
      triggerDamageEffect(damage);
      triggerShake();
    }
    // 2. 유닛이 파괴된 경우 (이전에는 있었는데 지금은 null)
    else if (!unit && prevUnit) {
      // 죽기 직전 체력만큼 데미지를 입었다고 가정하고 표시
      triggerDamageEffect(prevUnit.currentHp);
    }

    // 3. 유닛이 공격을 수행한 경우 (공격 모션 효과)
    if (unit && prevUnit && unit.id === prevUnit.id && !prevUnit.hasAttacked && unit.hasAttacked) {
      triggerShake();
    }

    prevUnitRef.current = unit;
  }, [unit]);

  const triggerDamageEffect = (amount: number) => {
    setDamageText({ id: Date.now(), text: `-${amount}` });
    setTimeout(() => setDamageText(null), 1000);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return { damageText, isShaking };
};