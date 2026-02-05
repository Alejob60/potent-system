const axios = require('axios');

async function testInteractiveIA() {
  try {
    console.log('🧪 Probando interacción con IA...');
    
    const response = await axios.post('http://localhost:3007/sprint2/interactive', {
      message: 'hola',
      sessionId: 'test-session-alejo',
      context: {
        userId: 'user-123',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'misybot'
      },
      timeout: 10000
    });
    
    console.log('✅ Respuesta recibida:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ El servidor no está corriendo en el puerto 3007');
      console.log('Por favor inicia el servidor con: npm run start:dev');
    } else if (error.response) {
      console.log('❌ Error del servidor:');
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log('❌ Error desconocido:', error.message);
    }
  }
}

// Ejecutar la prueba
testInteractiveIA();