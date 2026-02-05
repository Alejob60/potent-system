const axios = require('axios');

async function testValidPayload() {
  console.log('=== PRUEBA DE PAYLOAD VÁLIDO ===\n');
  
  // Configuración del cliente
  const client = axios.create({
    baseURL: 'http://localhost:3007/api/v1/v2/agents/front-desk',
    timeout: 5000,
  });
  
  // Payload válido
  const validPayload = {
    message: 'Quiero crear un video para TikTok',
    context: {
      sessionId: 'test-session-123',
      language: 'es'
    }
  };
  
  console.log('Payload válido:', JSON.stringify(validPayload, null, 2));
  
  try {
    const response = await client.post('', validPayload);
    console.log('\n✅ Éxito:', response.status);
    console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    
    // Verificar si la respuesta indica éxito
    if (response.data.success) {
      console.log('\n🎉 El payload válido funciona correctamente');
    } else {
      console.log('\n❌ Aunque el código es 200, la respuesta indica error:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.log('\n❌ Error HTTP:', error.response.status);
      console.log('Mensaje:', error.response.data?.message || error.response.statusText);
    } else {
      console.log('\n❌ Error de red:', error.message);
    }
  }
  
  console.log('\n=== PRUEBA COMPLETADA ===');
}

testValidPayload();