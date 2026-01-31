import { useEffect } from "react";
import "../css/Toast.css";
import type { GameError } from "@card-game/shared";

interface ToastProps {
  error: GameError;
  onClose: () => void;
}

export const Toast = ({ error, onClose }: ToastProps) => {
  const duration = 3000;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, error]);

  return (
    <div className="toast-container" onClick={onClose}>
      <span className="toast-icon">⚠️</span>
      <div className="toast-message">{error.message}</div>
    </div>
  );
};