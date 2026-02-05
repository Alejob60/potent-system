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
      timeout: 15000 // 15 segundos de timeout
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
          ...(keys.length > 5 ? { '...': `[${keys.length - 5} más]` } : {})
        }, null, 2));
      } else {
        console.log('📄 Respuesta completa:', JSON.stringify(response.data, null, 2));
      }
    } else {
      console.log('📄 Respuesta:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error en ${description || method + ' ' + endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Función para esperar un tiempo determinado
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAgentWorkflowTest() {
  try {
    console.log('\n📋 INICIANDO PRUEBA DE FLUJO DE AGENTES');
    console.log('=====================================');
    
    // 1. Probar Trend Scanner Agent
    console.log('\n🔍 PASO 1: Probando AgentTrendScannerV2');
    console.log('----------------------------------------');
    
    const trendScannerData = {
      sessionId: TEST_SESSION_ID,
      userId: TEST_USER_ID,
      platform: 'tiktok',
      topic: 'inteligencia artificial',
      dateRange: 'last_7_days'
    };
    
    const trendResult = await callApi(
      '/api/v2/agent/trend-scanner',
      'POST',
      trendScannerData,
      'Ejecutando Trend Scanner Agent'
    );
    
    if (!trendResult.success) {
      throw new Error('Trend Scanner Agent falló: ' + trendResult.error);
    }
    
    const trendId = trendResult.data?.analysis?.id || `trend-${Date.now()}`;
    console.log('🆔 ID de tendencia generado:', trendId);
    
    // Esperar un momento para que se procese
    await sleep(1000);
    
    // 2. Probar Analytics Reporter Agent
    console.log('\n📊 PASO 2: Probando AgentAnalyticsReporterV2');
    console.log('-------------------------------------------');
    
    const analyticsData = {
      sessionId: TEST_SESSION_ID,
      userId: TEST_USER_ID,
      metric: 'engagement',
      period: 'last_7_days',
      trendId: trendId
    };
    
    const analyticsResult = await callApi(
      '/api/v2/agent/analytics-reporter/execute',
      'POST',
      analyticsData,
      'Ejecutando Analytics Reporter Agent'
    );
    
    if (!analyticsResult.success) {
      throw new Error('Analytics Reporter Agent falló: ' + analyticsResult.error);
    }
    
    const reportId = analyticsResult.data?.reportId || `report-${Date.now()}`;
    console.log('🆔 ID de informe generado:', reportId);
    
    // Esperar un momento para que se procese
    await sleep(1000);
    
    // 3. Probar Campaign Agent
    console.log('\n📢 PASO 3: Probando CampaignV2');
    console.log('------------------------------');
    
    const campaignData = {
      sessionId: TEST_SESSION_ID,
      userId: TEST_USER_ID,
      campaignName: 'Campaña IA Viral',
      objective: 'increase_engagement',
      targetAudience: 'tech_enthusiasts',
      budget: 2500,
      durationDays: 30,
      platforms: ['instagram', 'tiktok'],
      trendId: trendId,
      analyticsReportId: reportId
    };
    
    const campaignResult = await callApi(
      '/api/v2/agent/campaign/execute',
      'POST',
      campaignData,
      'Ejecutando Campaign Agent'
    );
    
    if (!campaignResult.success) {
      throw new Error('Campaign Agent falló: ' + campaignResult.error);
    }
    
    const campaignId = campaignResult.data?.id || `campaign-${Date.now()}`;
    console.log('🆔 ID de campaña generado:', campaignId);
    
    // 4. Verificar resultados individuales
    console.log('\n🔍 PASO 4: Verificando resultados individuales');
    console.log('---------------------------------------------');
    
    // Verificar Trend Scanner
    await callApi(
      `/api/v2/agent/trend-scanner/${trendId}`,
      'GET',
      null,
      'Obteniendo detalles de tendencia'
    );
    
    // Verificar Analytics Reporter
    await callApi(
      `/api/v2/agent/analytics-reporter/${reportId}`,
      'GET',
      null,
      'Obteniendo detalles de informe analítico'
    );
    
    // Verificar Campaign
    await callApi(
      `/api/v2/agent/campaign/${campaignId}`,
      'GET',
      null,
      'Obteniendo detalles de campaña'
    );
    
    // 5. Obtener métricas de todos los agentes
    console.log('\n📈 PASO 5: Obteniendo métricas de agentes');
    console.log('------------------------------------------');
    
    await callApi(
      '/api/v2/agent/trend-scanner/metrics',
      'GET',
      null,
      'Métricas de Trend Scanner'
    );
    
    await callApi(
      '/api/v2/agent/analytics-reporter/metrics',
      'GET',
      null,
      'Métricas de Analytics Reporter'
    );
    
    await callApi(
      '/api/v2/agent/campaign/metrics',
      'GET',
      null,
      'Métricas de Campaign'
    );
    
    // 6. Listar todos los registros
    console.log('\n📋 PASO 6: Listando todos los registros');
    console.log('---------------------------------------');
    
    await callApi(
      '/api/v2/agent/trend-scanner',
      'GET',
      null,
      'Listando todas las tendencias'
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
    
    console.log('\n🎉 PRUEBA COMPLETA');
    console.log('==================');
    console.log('✅ Todos los agentes respondieron correctamente');
    console.log('✅ El flujo Trend Scanner → Analytics Reporter → Campaign funciona correctamente');
    console.log('✅ Los datos se procesaron y almacenaron adecuadamente');
    console.log('✅ Las métricas están disponibles para monitoreo');
    
    return true;
  } catch (error) {
    console.error('\n💥 ERROR EN LA PRUEBA');
    console.error('=====================');
    console.error('_detalle:', error.message);
    
    // Verificar si el servidor está disponible
    try {
      await axios.get(`${BASE_URL}/api-docs`);
      console.log('✅ El servidor está disponible y responde en /api-docs');
    } catch (serverError) {
      console.error('❌ El servidor no está disponible o no responde');
      console.error('_detalle:', serverError.message);
    }
    
    return false;
  }
}

// Ejecutar la prueba
runAgentWorkflowTest()
  .then(success => {
    if (success) {
      console.log('\n🏁 PRUEBA FINALIZADA CON ÉXITO');
      process.exit(0);
    } else {
      console.log('\n🏁 PRUEBA FINALIZADA CON ERRORES');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 ERROR NO CONTROLADO:', error);
    process.exit(1);
  });