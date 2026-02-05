const http = require('http');

// Test with proper payload structure according to the DTO
const properPayload = {
  message: "Quiero crear un video viral para TikTok sobre mi producto nuevo",
  context: {
    sessionId: "test-session-123",
    language: "es"
  }
};

// Test with missing sessionId
const invalidPayload = {
  message: "Quiero crear un video viral para TikTok sobre mi producto nuevo"
  // Missing context with sessionId
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

async function testPayloadFix() {
  console.log('Testing Front Desk V2 payload validation fix...\n');
  
  try {
    // Test with proper payload
    console.log('=== Test 1: Proper Payload ===');
    await makeRequest(properPayload, 'Proper Payload');
    
    console.log('\n=== Test 2: Invalid Payload (Missing Session ID) ===');
    await makeRequest(invalidPayload, 'Invalid Payload');
    
    console.log('\n=== Payload Fix Test Completed ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPayloadFix();