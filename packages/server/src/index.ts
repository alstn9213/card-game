import { createServer } from "http";
import { Server } from "socket.io";
import { GameLogic } from "./game/GameLogic";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // 클라이언트 주소
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 각 클라이언트 연결마다 독립적인 게임 로직 인스턴스 생성
  let gameLogic: GameLogic | null = null;

  // 1. 게임 참여 (덱 정보 수신 및 게임 초기화)
  socket.on("joinGame", (deck: string[]) => {
    console.log(`[${socket.id}] Joining game with deck size: ${deck?.length}`);
    
    try {
      // 클라이언트에서 받은 덱 정보를 GameLogic 생성자에 전달
      gameLogic = new GameLogic(deck);
      
      // 초기화된 게임 상태를 클라이언트에 전송
      socket.emit("gameStateUpdate", gameLogic.getState());
    } catch (err: any) {
      console.error("Game initialization failed:", err);
      socket.emit("error", err.message || "Failed to initialize game.");
    }
  });

  // 2. 카드 사용
  socket.on("playCard", (cardIndex: number) => {
    if (!gameLogic) return;
    try {
      gameLogic.playCard(cardIndex);
      socket.emit("gameStateUpdate", gameLogic.getState());
    } catch (err: any) {
      socket.emit("error", err.message);
    }
  });

  // 3. 공격
  socket.on("attack", (attackerId: string, targetId: string) => {
    if (!gameLogic) return;
    try {
      gameLogic.attack(attackerId, targetId);
      socket.emit("gameStateUpdate", gameLogic.getState());
    } catch (err: any) {
      socket.emit("error", err.message);
    }
  });

  // 4. 턴 종료
  socket.on("endTurn", () => {
    if (!gameLogic) return;
    
    gameLogic.endTurn();
    socket.emit("gameStateUpdate", gameLogic.getState());

    // 적(AI) 턴 진행 (1초 딜레이로 연출)
    setTimeout(() => {
      if (!gameLogic) return;
      gameLogic.processEnemyTurn();
      socket.emit("gameStateUpdate", gameLogic.getState());
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    gameLogic = null; // 메모리 해제
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});