const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.post('/execute', async (req, res) => {
  try {
    const response = await fetch('https://manual-theatre-basketball-dinner.trycloudflare.com/api/v2/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('yjs-update', (update) => {
    if (socket.data.roomId) {
      socket.to(socket.data.roomId).emit('yjs-update', update);
    }
  });

    socket.on('awareness-update', (update) => {
    if (socket.data.roomId) {
      socket.to(socket.data.roomId).emit('awareness-update', update);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log('WebSocket server running on port 3001');
});