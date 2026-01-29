import "../css/GameModal.css";
import "../css/GameEffects.css";

interface RoundVictoryModalProps {
  onConfirm: () => void;
}

export const RoundVictoryModal = ({ onConfirm }: RoundVictoryModalProps) => {
  return (
    <div className="modal-overlay">
      {/* 폭죽 효과 */}
      <div className="firework-effect" style={{ top: '30%', left: '20%', animationDelay: '0s' }}></div>
      <div className="firework-effect" style={{ top: '25%', left: '80%', animationDelay: '0.2s' }}></div>
      <div className="firework-effect" style={{ top: '60%', left: '15%', animationDelay: '0.4s' }}></div>
      <div className="firework-effect" style={{ top: '55%', left: '85%', animationDelay: '0.6s' }}></div>
      <div className="firework-effect" style={{ top: '15%', left: '50%', animationDelay: '0.3s' }}></div>

      <div className="modal-content">
        <div className="modal-title" style={{ color: "#f1c40f" }}>ROUND CLEAR!</div>
        <div className="modal-message">
          모든 적을 물리쳤습니다!<br />
          상점에서 정비 후 다음 라운드를 준비하세요.
        </div>
        <button 
          className="modal-btn"
          onClick={onConfirm}
          style={{ backgroundColor: "#f1c40f", color: "#2c3e50", fontWeight: "bold" }}
        >
          확인
        </button>
      </div>
    </div>
  );
};