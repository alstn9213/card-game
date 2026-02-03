import { useState, useEffect } from 'react';
import '../css/GameEffects.css';
import { SPELL_CARDS } from '@card-game/shared';

interface SpellCastAnimationProps {
    cardId: string;
}

export const SpellCastAnimation = ({ cardId }: SpellCastAnimationProps) => {
    const [visible, setVisible] = useState(true);
    const card = SPELL_CARDS.find(c => c.cardId === cardId);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 1500); // 애니메이션 지속 시간
        return () => clearTimeout(timer);
    }, []);

    if (!visible || !card) {
      console.warn("[SpellCastAnimation] visible이나 card가 없습니다.");
      return null;
    }

    return (
        <div className="spell-cast-overlay">
            <div className="spell-card-name">{card.name}</div>
        </div>
    );
};