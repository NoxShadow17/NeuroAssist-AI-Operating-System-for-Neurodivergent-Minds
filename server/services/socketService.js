// Socket.IO service for Focus Rooms (Body Doubling)
const rooms = new Map(); // roomCode -> { participants, timer, timerRunning, startTime }

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a focus room
    socket.on('join-room', ({ roomCode, userName, userId }) => {
      socket.join(roomCode);

      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, {
          participants: [],
          timer: 25 * 60,
          timerRunning: false,
          startTime: null,
        });
      }

      const room = rooms.get(roomCode);
      const participant = { id: socket.id, userId, userName, joinedAt: Date.now() };

      // Remove duplicates
      room.participants = room.participants.filter(p => p.userId !== userId);
      room.participants.push(participant);

      // Notify everyone in room
      io.to(roomCode).emit('room-updated', {
        participants: room.participants,
        participantCount: room.participants.length,
      });

      // Send current timer state to new joiner
      socket.emit('timer-state', {
        timer: room.timer,
        timerRunning: room.timerRunning,
        startTime: room.startTime,
      });

      console.log(`${userName} joined room ${roomCode}. Participants: ${room.participants.length}`);
    });

    // Start room timer
    socket.on('start-timer', ({ roomCode }) => {
      if (!rooms.has(roomCode)) return;
      const room = rooms.get(roomCode);
      room.timerRunning = true;
      room.startTime = Date.now();
      io.to(roomCode).emit('timer-state', { timerRunning: true, startTime: room.startTime, timer: room.timer });
    });

    // Pause room timer
    socket.on('pause-timer', ({ roomCode, timeRemaining }) => {
      if (!rooms.has(roomCode)) return;
      const room = rooms.get(roomCode);
      room.timerRunning = false;
      room.timer = timeRemaining;
      io.to(roomCode).emit('timer-state', { timerRunning: false, timer: timeRemaining });
    });

    // Reset room timer
    socket.on('reset-timer', ({ roomCode, duration }) => {
      if (!rooms.has(roomCode)) return;
      const room = rooms.get(roomCode);
      room.timerRunning = false;
      room.timer = duration * 60;
      room.startTime = null;
      io.to(roomCode).emit('timer-state', { timerRunning: false, timer: room.timer, startTime: null });
    });

    // Send message in room
    socket.on('send-message', ({ roomCode, message, userName }) => {
      io.to(roomCode).emit('new-message', {
        id: Date.now(),
        userName,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // Leave room
    socket.on('leave-room', ({ roomCode, userId }) => {
      handleLeave(socket, io, roomCode, userId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Remove from all rooms
      for (const [roomCode, room] of rooms.entries()) {
        const before = room.participants.length;
        room.participants = room.participants.filter(p => p.id !== socket.id);
        if (room.participants.length !== before) {
          io.to(roomCode).emit('room-updated', {
            participants: room.participants,
            participantCount: room.participants.length,
          });
          // Clean up empty rooms
          if (room.participants.length === 0) {
            rooms.delete(roomCode);
          }
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const handleLeave = (socket, io, roomCode, userId) => {
  socket.leave(roomCode);
  if (!rooms.has(roomCode)) return;

  const room = rooms.get(roomCode);
  room.participants = room.participants.filter(p => p.userId !== userId && p.id !== socket.id);

  io.to(roomCode).emit('room-updated', {
    participants: room.participants,
    participantCount: room.participants.length,
  });

  if (room.participants.length === 0) {
    rooms.delete(roomCode);
  }
};

export default { setupSocketHandlers };
