const { createClient } = require('redis');

async function testRedisConnection() {
  const client = createClient({
    url: 'redis://localhost:6379'
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  try {
    await client.connect();
    console.log('  Connected to Redis successfully');

    // Test setting a value
    await client.set('test-key', 'test-value', {
      EX: 60 // Expire in 60 seconds
    });
    console.log('  Set test-key successfully');

    // Test getting a value
    const value = await client.get('test-key');
    console.log('  Got value:', value);

    // Test deleting a value
    await client.del('test-key');
    console.log('  Deleted test-key successfully');

    await client.quit();
    console.log('  Disconnected from Redis');
  } catch (error) {
    console.error('  Redis connection test failed:', error.message);
    process.exit(1);
  }
}

testRedisConnection();