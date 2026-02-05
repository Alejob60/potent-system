const http = require('http');

// Test with proper payload structure according to the DTO
const properPayload = {
  message: "Hola, necesito ayuda para crear contenido",
  context: {
    sessionId: "test-session-payload-only",
    language: "es"
  }
};

const options = {
  hostname: 'localhost',
  port: 3007,
  path: '/api/v1/v2/agents/front-desk',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

function makeRequest(data, description) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);
    options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    
    const req = http.request(options, (res) => {
      console.log(`${description} - Status: ${res.statusCode}`);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedResponse = JSON.parse(responseData);
          console.log(`${description} - Response:`);
          console.log(JSON.stringify(parsedResponse, null, 2));
          resolve(parsedResponse);
        } catch (e) {
          console.log(`${description} - Raw response:`, responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`${description} - Error:`, error.message);
      reject(error);
    });

    req.write(jsonData);
    req.end();
  });
}

async function testPayloadOnly() {
  console.log('Testing Front Desk V2 with payload only (no database required)...\n');
  
  try {
    // Test with proper payload
    console.log('=== Test: Proper Payload ===');
    await makeRequest(properPayload, 'Proper Payload');
    
    console.log('\n=== Payload Test Completed ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPayloadOnly();