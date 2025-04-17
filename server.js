// Запускаем socket.io на порту 3000
const io = require('socket.io')(3000, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  console.log(`Новое подключение: ${socket.id}`);

  // 1. Broadcaster просит сгенерировать код
  socket.on('generateCode', () => {
    // Генерация 4-значного кода
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    // Отправляем код обратно только тому, кто запросил
    socket.emit('codeGenerated', code);
    console.log(`Сгенерированный код для ${socket.id}: ${code}`);
  });

  // 2. Viewer (или клиент) посылает код, чтобы «подключиться» к Broadcaster
  socket.on('connectToDevice', (data) => {
    // data = { code: "1234" }
    console.log(`Запрос на подключение с кодом ${data.code} от ${socket.id}`);
    // Широковещательно уведомим всех, что кто-то «подключился» с таким кодом
    io.emit('deviceConnected', data);
  });

  // 3. Broadcaster отправляет кадры экрана (base64)
  socket.on('screenVideoData', (base64Frame) => {
    // Отправляем всем, кроме самого отправителя
    socket.broadcast.emit('screenVideoData', {
      broadcasterId: socket.id,
      frame: base64Frame
    });
  });

  // --- WebRTC (если нужно) ---
  socket.on('offer', (payload) => {
    console.log(`Получен offer от ${socket.id}`);
    socket.broadcast.emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    console.log(`Получен answer от ${socket.id}`);
    socket.broadcast.emit('answer', payload);
  });

  socket.on('iceCandidate', (payload) => {
    console.log(`Получен iceCandidate от ${socket.id}`);
    socket.broadcast.emit('iceCandidate', payload);
  });
});

console.log('Сигнальный сервер запущен на порту 3000');
