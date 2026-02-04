import React from "react";
import "../css/GameModal.css";
import "../css/Card.css";
import type { GameCard } from "@card-game/shared";

interface ExhaustPileModalProps {
  cards: GameCard[];
  onClose: () => void;
}

export const ExhaustPileModal: React.FC<ExhaustPileModalProps> = ({ cards, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '800px', width: '90%' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e74c3c' }}>
          묘지 ({cards.length})
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          justifyContent: 'center', 
          maxHeight: '60vh', 
          overflowY: 'auto',
          padding: '10px'
        }}>
          {cards.length === 0 ? (
            <p style={{ color: '#aaa' }}>묘지에 카드가 없습니다.</p>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="card" style={{ position: 'relative', transform: 'scale(0.9)' }}>
                <div className="card-cost">{card.cost}</div>
                <div className="card-name">{card.name}</div>
                <div className="card-desc">{card.description}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '8px 24px', cursor: 'pointer', fontSize: '16px' }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};