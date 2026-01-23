import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // 모든 곳에서 접속 허용 (개발용)
});

io.on('connection', (socket) => {
  console.log('플레이어가 접속했습니다:', socket.id);
});

httpServer.listen(3000, () => {
  console.log(`서버가 3000번 포트에서 실행 중입니다.`);
});