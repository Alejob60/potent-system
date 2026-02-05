/**
 * Simple endpoint test script for agents
 * 
 * This script tests the basic functionality of agent endpoints
 * to verify they are properly configured and responding.
 */

const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 5000;

// Test cases for each agent
const agentTests = [
  {
    name: 'Trend Scanner',
    endpoints: [
      { method: 'GET', path: '/v2/agents/trend-scanner/metrics' },
      { method: 'GET', path: '/v2/agents/trend-scanner' }
    ]
  },
  {
    name: 'FAQ Responder',
    endpoints: [
      { method: 'GET', path: '/v2/agents/faq-responder/metrics' },
      { method: 'GET', path: '/v2/agents/faq-responder' }
    ]
  },
  {
    name: 'Content Editor',
    endpoints: [
      { method: 'GET', path: '/api/v2/agent/content-editor/metrics' },
      { method: 'GET', path: '/api/v2/agent/content-editor' }
    ]
  }
];

/**
 * Test a single endpoint
 */
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.path}`;
    console.log(`Testing ${endpoint.method} ${url}`);
    
    const req = http.request(
      url,
      {
        method: endpoint.method,
        timeout: TIMEOUT
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            endpoint: `${endpoint.method} ${endpoint.path}`,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            response: data
          });
        });
      }
    );
    
    req.on('error', (error) => {
      resolve({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

/**
 * Test all endpoints for an agent
 */
async function testAgent(agent) {
  console.log(`\n=== Testing ${agent.name} ===`);
  
  const results = [];
  for (const endpoint of agent.endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      results.push(result);
      
      if (result.success) {
        console.log(`  ✓ ${result.endpoint} - Status: ${result.status}`);
      } else {
        console.log(`  ✗ ${result.endpoint} - Status: ${result.status}`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`  ✗ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
    }
  }
  
  return {
    agent: agent.name,
    results
  };
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Agent Endpoint Health Check');
  console.log('==========================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  const allResults = [];
  
  for (const agent of agentTests) {
    const result = await testAgent(agent);
    allResults.push(result);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  let totalTests = 0;
  let passedTests = 0;
  
  for (const agentResult of allResults) {
    const agentPassed = agentResult.results.filter(r => r.success).length;
    const agentTotal = agentResult.results.length;
    
    console.log(`${agentResult.agent}: ${agentPassed}/${agentTotal} passed`);
    
    totalTests += agentTotal;
    passedTests += agentPassed;
  }
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All endpoint tests passed!');
  } else {
    console.log('⚠️  Some endpoint tests failed.');
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testEndpoint, testAgent };