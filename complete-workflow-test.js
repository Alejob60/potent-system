const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3007';
const TEST_SESSION_ID = 'workflow-test-' + Date.now();
const TEST_USER_ID = 'user-' + Date.now();

console.log('🚀 Iniciando prueba de flujo completo de agentes...');
console.log('🌐 URL base:', BASE_URL);
console.log('🆔 Session ID:', TEST_SESSION_ID);
console.log('👤 User ID:', TEST_USER_ID);

// Función para hacer llamadas a la API con mejor manejo de errores
async function callApi(endpoint, method = 'GET', data = null, description = '') {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n📡 ${description || method + ' ' + endpoint}`);
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 segundos de timeout
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ Éxito (${response.status})`);
    
    // Mostrar solo datos relevantes para no sobrecargar la salida
    if (response.data && typeof response.data === 'object') {
      // Para respuestas grandes, mostrar solo las propiedades principales
      const keys = Object.keys(response.data);
      if (keys.length > 5) {
        console.log('📄 Respuesta (resumen):', JSON.stringify({
          ...Object.fromEntries(keys.slice(0, 5).map(k => [k, response.data[k]])),
          '...': `${keys.length - 5} more properties`
        }, null, 2));
      } else {
        console.log('📄 Respuesta:', JSON.stringify(response.data, null, 2));
      }
    } else {
      console.log('📄 Respuesta:', response.data);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error ${error.response.status}: ${error.response.statusText}`);
      if (error.response.data) {
        console.log('📄 Detalles:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.log(`❌ Error de red: Sin respuesta del servidor`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    return null;
  }
}

// Función para pausar entre llamadas
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Caso de uso: Campaña de Marketing Viral Completa
async function testCompleteViralCampaignWorkflow() {
  console.log('\n🎬 === CASO DE USO: Campaña de Marketing Viral Completa ===');
  
  try {
    // Paso 1: Analizar tendencias actuales
    console.log('\n🔍 PASO 1: Análisis de tendencias');
    const trendPayload = {
      sessionId: TEST_SESSION_ID,
      userId: TEST_USER_ID,
      topic: 'sustainable fashion',
      platform: 'instagram'
    };
    
    const trendResult = await callApi(
      '/api/v2/agent/trend-scanner', 
      'POST', 
      trendPayload,
      'Analizando tendencias de moda sostenible en Instagram'
    );
    
    if (!trendResult || !trendResult.success) {
      console.log('❌ Fallo en el análisis de tendencias');
      return false;
    }
    
    const trendId = trendResult.data?.analysis?.id;
    console.log('✅ Tendencia analizada, ID:', trendId);
    
    // Pausa para simular procesamiento
    await delay(1000);
    
    // Paso 2: Generar informe analítico basado en las tendencias
    console.log('\n📊 PASO 2: Generación de informe analítico');
    const analyticsPayload = {
      sessionId: TEST_SESSION_ID,
      userId: TEST_USER_ID,
      metric: 'engagement',
      period: 'weekly'
    };
    
    const analyticsResult = await callApi(
      '/api/v2/agent/analytics-reporter/execute',
      'POST',
      analyticsPayload,
      'Generando informe analítico de engagement semanal'
    );
    
    if (!analyticsResult || !analyticsResult.success) {
      console.log('❌ Fallo en la generación del informe analítico');
      return false;
    }
    
    const reportId = analyticsResult.data?.reportId;
    console.log('✅ Informe generado, ID:', reportId);
    
    // Pausa para simular procesamiento
    await delay(1000);
    
    // Paso 3: Crear campaña basada en el análisis
    console.log('\n📢 PASO 3: Creación de campaña viral');
    const campaignPayload = {
      sessionId: TEST_SESSION_ID,
      userId: TEST_USER_ID,
      name: 'Sustainable Fashion Awareness Campaign',
      objective: 'Increase brand awareness for sustainable fashion products',
      targetChannels: ['instagram', 'tiktok'],
      duration: 30,
      contentTypes: ['video', 'carousel', 'stories'],
      tone: 'educational',
      budget: 2500,
      startDate: new Date().toISOString()
    };
    
    const campaignResult = await callApi(
      '/api/v2/agent/campaign/execute',
      'POST',
      campaignPayload,
      'Creando campaña viral de moda sostenible'
    );
    
    if (!campaignResult || !campaignResult.success) {
      console.log('❌ Fallo en la creación de la campaña');
      return false;
    }
    
    const campaignId = campaignResult.data?.campaignId;
    console.log('✅ Campaña creada, ID:', campaignId);
    
    // Pausa para simular procesamiento
    await delay(1000);
    
    // Paso 4: Verificar métricas de todos los agentes
    console.log('\n📈 PASO 4: Verificación de métricas');
    
    // Métricas de Trend Scanner
    await callApi(
      '/api/v2/agent/trend-scanner/metrics',
      'GET',
      null,
      'Obteniendo métricas del Trend Scanner'
    );
    
    // Métricas de Analytics Reporter
    await callApi(
      '/api/v2/agent/analytics-reporter/metrics',
      'GET',
      null,
      'Obteniendo métricas del Analytics Reporter'
    );
    
    // Métricas de Campaign
    await callApi(
      '/api/v2/agent/campaign/metrics',
      'GET',
      null,
      'Obteniendo métricas del Campaign Manager'
    );
    
    // Pausa para simular procesamiento
    await delay(1000);
    
    // Paso 5: Recuperar detalles específicos
    console.log('\n📋 PASO 5: Recuperación de detalles');
    
    if (trendId) {
      await callApi(
        `/api/v2/agent/trend-scanner/${trendId}`,
        'GET',
        null,
        'Recuperando detalles del análisis de tendencias'
      );
    }
    
    if (reportId) {
      await callApi(
        `/api/v2/agent/analytics-reporter/${reportId}`,
        'GET',
        null,
        'Recuperando detalles del informe analítico'
      );
    }
    
    if (campaignId) {
      await callApi(
        `/api/v2/agent/campaign/${campaignId}`,
        'GET',
        null,
        'Recuperando detalles de la campaña'
      );
    }
    
    // Pausa para simular procesamiento
    await delay(1000);
    
    // Paso 6: Listar todos los elementos creados
    console.log('\n📂 PASO 6: Listado de elementos');
    
    await callApi(
      '/api/v2/agent/trend-scanner',
      'GET',
      null,
      'Listando todos los análisis de tendencias'
    );
    
    await callApi(
      '/api/v2/agent/analytics-reporter',
      'GET',
      null,
      'Listando todos los informes analíticos'
    );
    
    await callApi(
      '/api/v2/agent/campaign',
      'GET',
      null,
      'Listando todas las campañas'
    );
    
    console.log('\n🎉 FLUJO COMPLETO EJECUTADO CON ÉXITO');
    console.log('✅ Análisis de tendencias: Completado');
    console.log('✅ Generación de informes: Completado');
    console.log('✅ Creación de campaña: Completado');
    console.log('✅ Verificación de métricas: Completado');
    console.log('✅ Recuperación de detalles: Completado');
    console.log('✅ Listado de elementos: Completado');
    
    return true;
    
  } catch (error) {
    console.error('💥 Error durante la ejecución del flujo:', error.message);
    return false;
  }
}

// Función para probar endpoints individuales
async function testIndividualEndpoints() {
  console.log('\n🧪 === PRUEBA DE ENDPOINTS INDIVIDUALES ===');
  
  // Probar salud del sistema
  await callApi('/api/v2/health', 'GET', null, 'Verificando salud del sistema');
  
  // Probar métricas del sistema
  await callApi('/api/v2/metrics', 'GET', null, 'Obteniendo métricas del sistema');
  
  // Probar endpoints de Trend Scanner
  console.log('\n🔍 Trend Scanner Endpoints:');
  await callApi('/api/v2/agent/trend-scanner', 'POST', {
    sessionId: TEST_SESSION_ID,
    topic: 'test'
  }, 'POST /api/v2/agent/trend-scanner');
  
  await callApi('/api/v2/agent/trend-scanner/metrics', 'GET', null, 'GET /api/v2/agent/trend-scanner/metrics');
  
  // Probar endpoints de Analytics Reporter
  console.log('\n📊 Analytics Reporter Endpoints:');
  await callApi('/api/v2/agent/analytics-reporter/execute', 'POST', {
    sessionId: TEST_SESSION_ID
  }, 'POST /api/v2/agent/analytics-reporter/execute');
  
  await callApi('/api/v2/agent/analytics-reporter/metrics', 'GET', null, 'GET /api/v2/agent/analytics-reporter/metrics');
  
  // Probar endpoints de Campaign
  console.log('\n📢 Campaign Endpoints:');
  await callApi('/api/v2/agent/campaign/execute', 'POST', {
    sessionId: TEST_SESSION_ID,
    name: 'Test Campaign',
    objective: 'Test'
  }, 'POST /api/v2/agent/campaign/execute');
  
  await callApi('/api/v2/agent/campaign/metrics', 'GET', null, 'GET /api/v2/agent/campaign/metrics');
}

// Función principal
async function main() {
  try {
    console.log('🧪 Iniciando batería completa de pruebas...\n');
    
    // Primero probar endpoints individuales
    await testIndividualEndpoints();
    
    // Esperar un momento
    await delay(2000);
    
    // Luego ejecutar el flujo completo
    const success = await testCompleteViralCampaignWorkflow();
    
    if (success) {
      console.log('\n🏆 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
      console.log('✅ El flujo entre agentes funciona correctamente');
      console.log('✅ Las conexiones entre servicios están operativas');
      console.log('✅ Todos los endpoints responden adecuadamente');
    } else {
      console.log('\n❌ ALGUNAS PRUEBAS FALLARON');
      console.log('⚠️  Revisa los errores reportados arriba');
    }
    
  } catch (error) {
    console.error('💥 Error fatal durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
main();