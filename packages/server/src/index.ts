import { createServer } from 'http';
import { express } from 'express';
import { ClientToServerEvents, ServerToClientEvents } from "@card-game/shared";
import { Server } from "socket.io";
import { GameSession } from "./game/GameSession";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const sessions = new Map<string, GameSession>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 접속하자마자 새 게임 세션 생성 (싱글 플레이어)
  const session = new GameSession(socket);
  sessions.set(socket.id, session);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    sessions.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});