const axios = require('axios');

async function testRoutingBehavior() {
  console.log('=== PRUEBA DE COMPORTAMIENTO DE ENRUTAMIENTO ===\n');
  
  // Configuración del cliente
  const client = axios.create({
    baseURL: 'http://localhost:3007/api/v1/v2/agents/front-desk',
    timeout: 5000,
  });
  
  // Diferentes mensajes para probar el enrutamiento
  const testMessages = [
    {
      message: 'Quiero crear un video para TikTok',
      expected: 'video-scriptor'
    },
    {
      message: 'Necesito ayuda con las tendencias de redes sociales',
      expected: 'trend-scanner'
    },
    {
      message: 'Tengo una pregunta sobre mi cuenta',
      expected: 'faq-responder'
    },
    {
      message: 'Quiero programar una publicación para mañana',
      expected: 'post-scheduler'
    },
    {
      message: 'Necesito un informe de análisis de mi campaña',
      expected: 'analytics-reporter'
    },
    {
      message: 'Hola, necesito ayuda general',
      expected: 'general'
    }
  ];
  
  for (const test of testMessages) {
    const payload = {
      message: test.message,
      context: {
        sessionId: `test-session-${Date.now()}`,
        language: 'es'
      }
    };
    
    console.log(`\n--- Mensaje: "${test.message}" ---`);
    console.log('Esperado:', test.expected);
    
    try {
      const response = await client.post('', payload);
      
      if (response.data.success) {
        const routingDecision = response.data.data.routingDecision;
        console.log('✅ Éxito');
        console.log('Enrutamiento:', routingDecision);
        
        if (routingDecision === test.expected) {
          console.log('✅ Enrutamiento correcto');
        } else {
          console.log('⚠️  Enrutamiento diferente al esperado');
        }
      } else {
        console.log('❌ Error en la respuesta:', response.data.error);
      }
    } catch (error) {
      if (error.response) {
        console.log('❌ Error HTTP:', error.response.status);
        console.log('Mensaje:', error.response.data?.message || error.response.statusText);
      } else {
        console.log('❌ Error de red:', error.message);
      }
    }
  }
  
  console.log('\n=== PRUEBA COMPLETADA ===');
}

testRoutingBehavior();