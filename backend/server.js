const cors = require('cors');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const mongoose = require('mongoose');

const app = express();

const authRoutes = require('./routes/auth');

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

const server = http.createServer(app);

const io = socketio(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`${socket.id} joined chat ${chatId}`);
  });

  socket.on('sendMessage', (message) => {
    io.to(message.chatId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

