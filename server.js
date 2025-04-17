const io = require('socket.io')(3000, {
  cors: { origin: "*" }
});

const broadcasters = {};

io.on('connection', (socket) => {
  console.log(`Новое подключение: ${socket.id}`);

  socket.on('generateCode', () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    broadcasters[code] = socket.id;
    socket.emit('codeGenerated', code);
    console.log(`Сгенерированный код для ${socket.id}: ${code}`);
  });

  socket.on('connectToDevice', (data) => {
    let enteredCode = "";
    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].code) {
        enteredCode = data[0].code.toString().trim();
      }
    } else if (data && data.code) {
      enteredCode = data.code.toString().trim();
    }
    console.log(`Viewer ${socket.id} пытается подключиться с кодом: "${enteredCode}"`);
    if (enteredCode !== "" && broadcasters.hasOwnProperty(enteredCode)) {
      const broadId = broadcasters[enteredCode];
      console.log(`Viewer ${socket.id} подключился к Broadcaster ${broadId}`);
      io.to(broadId).emit('deviceConnected', { code: enteredCode, viewerId: socket.id });
    } else {
      console.log(`Неверный код: "${enteredCode}"`);
      socket.emit('invalidCode', { message: 'Неверный код подключения' });
    }
  });

  socket.on('screenVideoData', (data) => {
    socket.broadcast.emit('screenVideoData', data);
  });

  socket.on('touchStart', (data) => {
    socket.broadcast.emit('touchStart', data);
  });
  socket.on('touchMove', (data) => {
    socket.broadcast.emit('touchMove', data);
  });
  socket.on('touchEnd', (data) => {
    socket.broadcast.emit('touchEnd', data);
  });

  socket.on('systemAction', (action) => {
    socket.broadcast.emit('systemAction', action);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    for (const code in broadcasters) {
      if (broadcasters[code] === socket.id) {
        delete broadcasters[code];
      }
    }
  });
});
