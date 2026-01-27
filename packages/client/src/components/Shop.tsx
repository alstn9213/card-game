import { ClientEvents } from '@card-game/shared';
import { useGameState } from '../hooks/useGameState';

export const Shop = () => {
  const { gameState, socket } = useGameState();

  if (!gameState) return null;

  const handleContinue = () => {
    socket?.emit(ClientEvents.CONTINUE_ROUND);
  };

  const handleBuy = (index: number) => {
    socket?.emit(ClientEvents.BUY_CARD, index);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h2 style={styles.title}>🏕️ 휴식처</h2>
        
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.icon}>💰</span>
            <span>{gameState.currentGold} G</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.icon}>❤️</span>
            <span>{gameState.player.currentHp} / {gameState.player.maxHp}</span>
          </div>
        </div>

        <div style={styles.message}>
          <p>전투를 마치고 잠시 숨을 고릅니다.</p>
          <p style={styles.subMessage}>체력이 소량 회복되었습니다.</p>
        </div>

        {gameState.shopItems.length > 0 && (
          <div style={styles.shopList}>
            <h3 style={styles.shopTitle}>🛒 전리품 상점</h3>
            <div style={styles.cardGrid}>
              {gameState.shopItems.map((card, index) => (
                <div key={index} style={styles.cardItem}>
                  <div style={styles.cardName}>{card.name}</div>
                  <div style={styles.cardCost}>🪙 {card.cost}</div>
                  <button 
                    onClick={() => handleBuy(index)}
                    style={{...styles.buyButton, opacity: gameState.currentGold >= card.cost ? 1 : 0.5}}
                    disabled={gameState.currentGold < card.cost}
                  >
                    구매
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleContinue} 
          style={styles.button}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          다음 라운드 진행 ⚔️
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  container: {
    backgroundColor: '#1a1a1a',
    padding: '40px',
    borderRadius: '20px',
    textAlign: 'center' as const,
    border: '1px solid #333',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    minWidth: '400px',
    color: '#fff',
  },
  title: {
    margin: '0 0 30px 0',
    fontSize: '2rem',
    color: '#f1c40f',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  icon: {
    fontSize: '1.5rem',
  },
  message: {
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  subMessage: {
    color: '#888',
    fontSize: '0.9rem',
  },
  button: {
    padding: '15px 40px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s',
    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
  },
  shopList: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: '15px',
  },
  shopTitle: {
    color: '#f39c12',
    marginBottom: '15px',
  },
  cardGrid: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  cardItem: {
    backgroundColor: '#2c3e50',
    padding: '15px',
    borderRadius: '10px',
    width: '120px',
    border: '1px solid #34495e',
  },
  cardName: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '0.9rem',
  },
  cardCost: {
    color: '#f1c40f',
    marginBottom: '10px',
  },
  buyButton: {
    width: '100%',
    padding: '5px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};