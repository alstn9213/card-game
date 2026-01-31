import { GameStatus } from "@card-game/shared";

interface GameResultModalProps {
  status: GameStatus;
  onReset: () => void;
}

export const GameResultModal = ({ status, onReset }: GameResultModalProps) => {
  const isVictory = status === GameStatus.VICTORY;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className={`modal-title ${status}`}>
          {isVictory ? "승리" : "패배"}
        </div>
        <div className="modal-message">
          {isVictory 
            ? "축하합니다! 모든 적을 물리쳤습니다." 
            : "아쉽게도 패배했습니다. 다시 도전해보세요."}
        </div>
        <button className="modal-btn" onClick={onReset}>
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};