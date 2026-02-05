const axios = require('axios');

async function testApi() {
  try {
    // Probar la ruta de salud
    const healthResponse = await axios.get('http://localhost:3007/api/v1/health');
    console.log('Health endpoint response:', healthResponse.data);
    
    // Probar la ruta V2 del Front Desk con el payload correcto
    console.log('\n--- Trying V2 Front Desk with sessionId ---');
    try {
      const frontDeskResponse = await axios.post('http://localhost:3007/api/v1/v2/agents/front-desk', {
        message: 'Hello, I need help with a video script',
        sessionId: 'test-session-123'
      });
      console.log('Front Desk V2 response:', frontDeskResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('Front Desk V2 error response:', error.response.data);
        console.log('Front Desk V2 error status:', error.response.status);
      } else {
        console.log('Front Desk V2 error:', error.message);
      }
    }
    
    // Probar la ruta V2 del Front Desk con contexto
    console.log('\n--- Trying V2 Front Desk with context ---');
    try {
      const frontDeskResponse2 = await axios.post('http://localhost:3007/api/v1/v2/agents/front-desk', {
        message: 'Hello, I need help with a video script',
        context: {
          sessionId: 'test-session-456',
          language: 'en'
        }
      });
      console.log('Front Desk V2 response with context:', frontDeskResponse2.data);
    } catch (error) {
      if (error.response) {
        console.log('Front Desk V2 error with context response:', error.response.data);
        console.log('Front Desk V2 error with context status:', error.response.status);
      } else {
        console.log('Front Desk V2 error with context:', error.message);
      }
    }
    
    // Probar la ruta V1 del Front Desk también
    console.log('\n--- Trying V1 Front Desk ---');
    try {
      const frontDeskV1Response = await axios.post('http://localhost:3007/api/v1/agents/front-desk', {
        message: 'Hello, I need help with a video script'
      });
      console.log('Front Desk V1 response:', frontDeskV1Response.data);
    } catch (error) {
      if (error.response) {
        console.log('Front Desk V1 error response:', error.response.data);
        console.log('Front Desk V1 error status:', error.response.status);
      } else {
        console.log('Front Desk V1 error:', error.message);
      }
    }
  } catch (error) {
    if (error.response) {
      console.log('Error response:', error.response.data);
      console.log('Error status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testApi();