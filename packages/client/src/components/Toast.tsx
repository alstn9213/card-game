import "../css/Toast.css";
import type { GameError } from "@card-game/shared";

interface ToastProps {
  error: GameError;
  onClose: () => void;
}

export const Toast = ({ error, onClose }: ToastProps) => {
  return (
    <div className="toast-container" onClick={onClose}>
      <span style={{ fontSize: "20px" }}>⚠️</span>
      <div className="toast-message">{error.message}</div>
    </div>
  );
};