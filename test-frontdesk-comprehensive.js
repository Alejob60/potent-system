const axios = require('axios');

async function testFrontDeskEndpoints() {
  const baseURL = 'http://localhost:3007/api/v1';
  const sessionId = 'test-session-' + Date.now();
  
  console.log('=== PRUEBA COMPLETA DE ENDPOINTS FRONTDESK ===\n');
  
  try {
    // 1. Verificar que el servicio está saludable
    console.log('1. Verificando estado del servicio...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Servicio saludable:', healthResponse.data);
    console.log('');
    
    // 2. Probar endpoint V2 del FrontDesk con diferentes tipos de mensajes
    console.log('2. Probando endpoint V2 del FrontDesk...');
    
    // Mensaje de video
    console.log('   a) Mensaje sobre video:');
    try {
      const videoResponse = await axios.post(`${baseURL}/v2/agents/front-desk`, {
        message: 'Necesito crear un video corto para redes sociales',
        context: {
          sessionId: sessionId + '-video',
          language: 'es'
        }
      });
      console.log('   ✅ Respuesta V2 para video:', JSON.stringify(videoResponse.data, null, 2));
    } catch (error) {
      console.log('   ❌ Error en mensaje de video:', error.response?.data || error.message);
    }
    
    // Mensaje de tendencias
    console.log('   b) Mensaje sobre tendencias:');
    try {
      const trendResponse = await axios.post(`${baseURL}/v2/agents/front-desk`, {
        message: '¿Cuáles son las tendencias actuales en redes sociales?',
        context: {
          sessionId: sessionId + '-trend',
          language: 'es'
        }
      });
      console.log('   ✅ Respuesta V2 para tendencias:', JSON.stringify(trendResponse.data, null, 2));
    } catch (error) {
      console.log('   ❌ Error en mensaje de tendencias:', error.response?.data || error.message);
    }
    
    // Mensaje de publicación
    console.log('   c) Mensaje sobre publicación:');
    try {
      const postResponse = await axios.post(`${baseURL}/v2/agents/front-desk`, {
        message: 'Quiero programar una publicación para mañana',
        context: {
          sessionId: sessionId + '-post',
          language: 'es'
        }
      });
      console.log('   ✅ Respuesta V2 para publicación:', JSON.stringify(postResponse.data, null, 2));
    } catch (error) {
      console.log('   ❌ Error en mensaje de publicación:', error.response?.data || error.message);
    }
    
    console.log('');
    
    // 3. Probar endpoint V1 del FrontDesk (si existe)
    console.log('3. Probando endpoint V1 del FrontDesk (si existe)...');
    try {
      const v1Response = await axios.post(`${baseURL}/agents/front-desk`, {
        message: 'Mensaje de prueba para V1'
      });
      console.log('   ✅ Respuesta V1:', JSON.stringify(v1Response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  Endpoint V1 no encontrado (esto es esperado)');
      } else {
        console.log('   ❌ Error en endpoint V1:', error.response?.data || error.message);
      }
    }
    
    console.log('');
    
    // 4. Probar métricas del FrontDesk V2
    console.log('4. Probando endpoint de métricas del FrontDesk V2...');
    try {
      const metricsResponse = await axios.get(`${baseURL}/v2/agents/front-desk/metrics`);
      console.log('   ✅ Métricas V2:', JSON.stringify(metricsResponse.data, null, 2));
    } catch (error) {
      console.log('   ❌ Error en métricas V2:', error.response?.data || error.message);
    }
    
    console.log('');
    
    // 5. Probar contexto de sesión
    console.log('5. Probando generación de contexto de sesión...');
    const sessionIdForContext = 'context-test-' + Date.now();
    
    // Enviar varios mensajes para construir contexto
    console.log('   a) Enviando primer mensaje...');
    await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: 'Hola, estoy interesado en crear contenido para TikTok',
      context: {
        sessionId: sessionIdForContext,
        language: 'es'
      }
    });
    
    console.log('   b) Enviando segundo mensaje...');
    await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: 'Me gustaría hacer un video sobre tendencias de navidad',
      context: {
        sessionId: sessionIdForContext,
        language: 'es'
      }
    });
    
    console.log('   ✅ Contexto de sesión generado correctamente');
    
    console.log('');
    
    // 6. Probar diferentes formatos de entrada
    console.log('6. Probando diferentes formatos de entrada...');
    
    // Mensaje corto
    console.log('   a) Mensaje corto:');
    try {
      const shortResponse = await axios.post(`${baseURL}/v2/agents/front-desk`, {
        message: 'Hola',
        context: {
          sessionId: sessionId + '-short',
          language: 'es'
        }
      });
      console.log('   ✅ Respuesta a mensaje corto:', JSON.stringify(shortResponse.data, null, 2));
    } catch (error) {
      console.log('   ❌ Error en mensaje corto:', error.response?.data || error.message);
    }
    
    // Mensaje largo
    console.log('   b) Mensaje largo:');
    try {
      const longResponse = await axios.post(`${baseURL}/v2/agents/front-desk`, {
        message: 'Tengo una idea para crear una campaña de marketing digital enfocada en redes sociales, específicamente en TikTok y Instagram. Quisiera crear contenido que sea atractivo para mi audiencia objetivo que son personas entre 18 y 35 años interesadas en tecnología y estilo de vida. ¿Podrías ayudarme a desarrollar esta idea?',
        context: {
          sessionId: sessionId + '-long',
          language: 'es'
        }
      });
      console.log('   ✅ Respuesta a mensaje largo:', JSON.stringify(longResponse.data, null, 2));
    } catch (error) {
      console.log('   ❌ Error en mensaje largo:', error.response?.data || error.message);
    }
    
    console.log('');
    
    console.log('=== PRUEBA COMPLETA FINALIZADA ===');
    
  } catch (error) {
    console.error('Error general en la prueba:', error.message);
  }
}

testFrontDeskEndpoints();