import React from "react";
import "../../css/GameModal.css";
import "../../css/Card.css";
import "../../css/ExhaustPileModal.css";
import type { GameCard } from "@card-game/shared";

interface ExhaustPileModalProps {
  cards: GameCard[];
  onClose: () => void;
}

export const ExhaustPileModal: React.FC<ExhaustPileModalProps> = ({ cards, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content exhaust-pile-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="exhaust-pile-title">
          묘지 ({cards.length})
        </h2>
        
        <div className="exhaust-pile-grid">
          {cards.length === 0 ? (
            <p className="exhaust-pile-empty">묘지에 카드가 없습니다.</p>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="card exhaust-pile-card-wrapper">
                <div className="card-cost">{card.cost}</div>
                <div className="card-name">{card.name}</div>
                <div className="card-desc">{card.description}</div>
              </div>
            ))
          )}
        </div>

        <div className="exhaust-pile-footer">
          <button onClick={onClose} className="exhaust-pile-close-btn">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};