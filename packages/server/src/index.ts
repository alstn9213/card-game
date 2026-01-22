import { createStarterDeck, Deck } from '@card-game/shared';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

app.get('/my-deck', (req, res) => {
    // 공유 코드에 있는 함수로 덱 생성
    const myDeck: Deck = createStarterDeck();
    
    console.log(`덱 이름: ${myDeck.name}`);
    console.log(`총 카드 수: ${myDeck.cards.length}장`);
    
    // 첫 번째 카드가 뭔지 확인
    console.log(`첫 번째 카드: ${myDeck.cards[0].name} (공격력: ${myDeck.cards[0].attackPower || 0})`);

    res.json(myDeck);
});

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