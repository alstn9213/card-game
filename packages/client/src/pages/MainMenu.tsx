import { useNavigate } from "react-router-dom";
import "../css/MainMenu.css";

export const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="main-menu-container">
      <h1 className="game-title">Card Game</h1>
      <div className="button-group">
        {/* '/game' 경로로 이동 */}
        <button 
          className="menu-button" 
          onClick={() => navigate('/game', { state: { deck: [] } })}
        >
          게임 시작
        </button>
        
        {/* '/deck' 경로로 이동 */}
        <button 
          className="menu-button" 
          onClick={() => navigate('/deck')}
        >
          덱 빌딩
        </button>
      </div>
    </div>
  );
};