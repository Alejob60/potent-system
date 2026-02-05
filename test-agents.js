const axios = require('axios');

// Configuración básica
const BASE_URL = 'http://localhost:3007';
const TEST_SESSION_ID = 'test-session-' + Date.now();

console.log('🔍 Iniciando pruebas de agentes...');
console.log('🌐 URL base:', BASE_URL);
console.log('🆔 Session ID:', TEST_SESSION_ID);

// Función para hacer llamadas a la API
async function callApi(endpoint, method = 'GET', data = null) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n🚀 Llamando a: ${method} ${url}`);
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ Éxito: ${response.status}`);
    console.log('📄 Respuesta:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error ${error.response.status}:`, error.response.statusText);
      console.log('📄 Detalles:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`❌ Error de red:`, error.message);
    }
    return null;
  }
}

// Prueba del agente Analytics Reporter
async function testAnalyticsReporter() {
  console.log('\n📊 === Probando Analytics Reporter ===');
  
  // Ejecutar análisis
  const analyticsPayload = {
    sessionId: TEST_SESSION_ID,
    metric: 'engagement',
    period: 'daily'
  };
  
  const result = await callApi('/api/v2/agent/analytics-reporter/execute', 'POST', analyticsPayload);
  
  if (result && result.success) {
    console.log('✅ Analytics Reporter funcionando correctamente');
    
    // Probar obtener métricas
    await callApi('/api/v2/agent/analytics-reporter/metrics', 'GET');
    
    // Probar obtener todos los informes
    await callApi('/api/v2/agent/analytics-reporter', 'GET');
    
    // Probar obtener informe específico
    if (result.data && result.data.reportId) {
      await callApi(`/api/v2/agent/analytics-reporter/${result.data.reportId}`, 'GET');
    }
  } else {
    console.log('❌ Error en Analytics Reporter');
  }
}

// Prueba del agente Trend Scanner
async function testTrendScanner() {
  console.log('\n📈 === Probando Trend Scanner ===');
  
  // Ejecutar análisis de tendencias
  const trendPayload = {
    sessionId: TEST_SESSION_ID,
    topic: 'technology',
    platform: 'twitter'
  };
  
  const result = await callApi('/api/v2/agent/trend-scanner', 'POST', trendPayload);
  
  if (result && result.success) {
    console.log('✅ Trend Scanner funcionando correctamente');
    
    // Probar obtener métricas
    await callApi('/api/v2/agent/trend-scanner/metrics', 'GET');
    
    // Probar obtener todos los análisis
    await callApi('/api/v2/agent/trend-scanner', 'GET');
    
    // Probar obtener análisis específico
    if (result.data && result.data.analysis && result.data.analysis.id) {
      await callApi(`/api/v2/agent/trend-scanner/${result.data.analysis.id}`, 'GET');
    }
  } else {
    console.log('❌ Error en Trend Scanner');
  }
}

// Prueba del agente Campaign
async function testCampaign() {
  console.log('\n📢 === Probando Campaign ===');
  
  // Crear campaña
  const campaignPayload = {
    sessionId: TEST_SESSION_ID,
    name: 'Test Campaign',
    objective: 'Increase brand awareness',
    targetChannels: ['social_media', 'email'],
    duration: 30,
    contentTypes: ['video', 'image'],
    tone: 'professional',
    budget: 1000
  };
  
  const result = await callApi('/api/v2/agent/campaign/execute', 'POST', campaignPayload);
  
  if (result && result.success) {
    console.log('✅ Campaign funcionando correctamente');
    
    // Probar obtener métricas
    await callApi('/api/v2/agent/campaign/metrics', 'GET');
    
    // Probar obtener todas las campañas
    await callApi('/api/v2/agent/campaign', 'GET');
    
    // Probar obtener campaña específica
    if (result.data && result.data.campaignId) {
      await callApi(`/api/v2/agent/campaign/${result.data.campaignId}`, 'GET');
    }
  } else {
    console.log('❌ Error en Campaign');
  }
}

// Función principal
async function main() {
  try {
    console.log('🧪 Iniciando conjunto completo de pruebas de agentes...\n');
    
    // Probar cada agente
    await testAnalyticsReporter();
    await testTrendScanner();
    await testCampaign();
    
    console.log('\n🏁 Pruebas completadas');
  } catch (error) {
    console.error('💥 Error durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
main();