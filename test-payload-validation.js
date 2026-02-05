const axios = require('axios');

async function testPayloadValidation() {
  console.log('=== PRUEBA DE VALIDACIÓN DE PAYLOAD ===\n');
  
  // Configuración del cliente
  const client = axios.create({
    baseURL: 'http://localhost:3007/api/v1/v2/agents/front-desk',
    timeout: 5000,
  });
  
  // Diferentes payloads para probar
  const testPayloads = [
    {
      name: 'Payload básico correcto con sessionId directo',
      payload: {
        message: 'Quiero crear un video para TikTok',
        sessionId: 'test-session-123'
      }
    },
    {
      name: 'Payload con contexto y sessionId',
      payload: {
        message: 'Necesito ayuda con mi campaña',
        context: {
          sessionId: 'test-session-456',
          language: 'es'
        }
      }
    },
    {
      name: 'Payload sin sessionId (debería fallar)',
      payload: {
        message: 'Hola, necesito ayuda'
      }
    },
    {
      name: 'Payload con contexto pero sin sessionId (debería fallar)',
      payload: {
        message: 'Ayuda con mi proyecto',
        context: {
          language: 'es'
        }
      }
    },
    {
      name: 'Payload vacío (debería fallar)',
      payload: {}
    },
    {
      name: 'Payload con message y sessionId en contexto',
      payload: {
        message: 'Quiero crear contenido para redes',
        context: {
          sessionId: 'test-session-789'
        }
      }
    }
  ];
  
  for (const test of testPayloads) {
    console.log(`\n--- ${test.name} ---`);
    console.log('Payload:', JSON.stringify(test.payload, null, 2));
    
    try {
      const response = await client.post('', test.payload);
      console.log('✅ Éxito:', response.status);
      console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log('❌ Error:', error.response.status);
        console.log('Mensaje:', error.response.data?.message || error.response.statusText);
      } else {
        console.log('❌ Error de red:', error.message);
      }
    }
  }
  
  console.log('\n=== PRUEBA COMPLETADA ===');
}

testPayloadValidation();