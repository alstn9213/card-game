import { createServer } from "http";
import { Server } from "socket.io";
import { GameSession } from "./game/GameSession";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // 클라이언트 주소
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client 연결됨. Socket ID:", socket.id);
  new GameSession(socket);
});

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});