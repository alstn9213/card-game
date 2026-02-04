import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { MainMenu } from './pages/MainMenu'
import { DeckBuilderPage } from './pages/DeckBuilderPage'
import { GameBoard } from './pages/GameBoard'
import { GameProvider } from './hooks/GameProvider'

const DeckBuilderWithNavigation = () => {
  const navigate = useNavigate();

  return (
    <DeckBuilderPage 
      onGameStart={(deck) => navigate('/game', { state: { deck } })}
      onBack={() => navigate('/')}
    />
  );
};

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          {/* 메인 화면 */}
          <Route path="/" element={<MainMenu />} />
          
          {/* 게임 화면 */}
          <Route path="/game" element={<GameBoard />} />
          
          <Route path="/deck" element={<DeckBuilderWithNavigation />} />

          {/* 정의되지 않은 경로로 접근 시 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  )
}

export default App
