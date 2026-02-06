import "../../css/GameModal.css";
import "../../css/GameEffects.css";

interface RoundVictoryModalProps {
  onConfirm: () => void;
}

export const RoundVictoryModal = ({ onConfirm }: RoundVictoryModalProps) => {
  // 폭죽 개수만큼 배열 생성 (5개)
  const fireworks = Array.from({ length: 5 });

  return (
    <div className="modal-overlay">
      
      {/* 폭죽 효과 */}
      {fireworks.map((_, index) => (
        <div key={index} className="firework-effect"></div>
      ))}

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