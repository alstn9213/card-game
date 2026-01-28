import type { GameError } from "@card-game/shared";

interface ErrorModalProps {
  error: GameError;
  onClose: () => void;
}

export const ErrorModal = ({ error, onClose }: ErrorModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title" style={{ color: "#e74c3c" }}>ERROR</div>
        <div className="modal-message">{error.message}</div>
        <button className="modal-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};