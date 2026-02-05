const io = require('socket.io-client');

// Conectar al servidor WebSocket
const socket = io('http://localhost:3007');

console.log('Conectando al servidor WebSocket...');

socket.on('connect', () => {
  console.log('Conexión establecida con el servidor');
  
  // Unirse a una sesión de prueba
  const sessionId = 'test-session-' + Date.now();
  console.log(`Uniéndose a la sesión: ${sessionId}`);
  
  socket.emit('join_session', { sessionId });
  
  // Enviar un mensaje de prueba después de un breve retraso
  setTimeout(() => {
    console.log('Enviando mensaje de prueba...');
    socket.emit('user_message', {
      sessionId,
      message: 'Hola, este es un mensaje de prueba',
      timestamp: new Date().toISOString()
    });
  }, 1000);
});

socket.on('session_joined', (data) => {
  console.log('Sesión unida exitosamente:', data);
});

socket.on('user_message_received', (data) => {
  console.log('Mensaje del usuario recibido por el servidor:', data);
});

socket.on('message_acknowledged', (data) => {
  console.log('Mensaje acknowledegado por el servidor:', data);
  
  // Desconectar después de recibir la confirmación
  console.log('Desconectando...');
  socket.disconnect();
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});