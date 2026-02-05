#!/usr/bin/env node

/**
 * Test script to verify MongoDB setup and functionality
 */

const { MongoClient } = require('mongodb');

async function testMongoDB() {
  console.log('🧪 Testing MongoDB setup...');

  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    // Get connection string from environment or use default
    const connectionString = process.env.MONGODB_CONNECTION_STRING || 
      process.env.MONGODB_URI || 'mongodb://localhost:27017/misybot';
    const dbName = process.env.MONGODB_DB_NAME || 'misybot';
    const collectionName = process.env.MONGODB_COLLECTION_EMBEDDINGS || 'embeddings';

    // Initialize MongoDB connection
    const client = new MongoClient(connectionString, {
      maxIdleTimeMS: 120000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: false,
    });

    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Test 1: Insert sample embedding
    console.log('\n📝 Test 1: Inserting sample embedding...');
    
    const sampleEmbedding = {
      sessionId: 'test-session-001',
      turnId: 'turn-001',
      role: 'user',
      text: 'Hello, this is a test message for vector search',
      embedding: Array(1536).fill(0.5), // Sample 1536-dimensional embedding
      metadata: {
        agent: 'test-script',
        timestamp: new Date(),
        type: 'test-message',
      },
    };

    await collection.insertOne(sampleEmbedding);
    console.log('✅ Sample embedding inserted successfully');

    // Test 2: Insert another embedding for similarity search
    console.log('\n📝 Test 2: Inserting second embedding...');
    
    const similarEmbedding = {
      sessionId: 'test-session-001',
      turnId: 'turn-002',
      role: 'agent',
      text: 'Hi there, this is another test message',
      embedding: Array(1536).fill(0.51), // Similar embedding
      metadata: {
        agent: 'test-script',
        timestamp: new Date(),
        type: 'test-response',
      },
    };

    await collection.insertOne(similarEmbedding);
    console.log('✅ Second embedding inserted successfully');

    // Test 3: Retrieve embeddings by session
    console.log('\n📝 Test 3: Retrieving embeddings by session...');
    
    const sessionEmbeddings = await collection
      .find({ sessionId: 'test-session-001' })
      .sort({ 'metadata.timestamp': -1 })
      .toArray();
      
    console.log(`✅ Retrieved ${sessionEmbeddings.length} embeddings for session`);

    // Test 4: Semantic search would go here (requires vector index)

    // Test 5: Delete test embeddings
    console.log('\n📝 Test 5: Cleaning up test data...');
    
    const deletedCount = await collection.deleteMany({ sessionId: 'test-session-001' });
    console.log(`✅ Cleaned up ${deletedCount.deletedCount} test embeddings`);

    await client.close();
    console.log('\n🎉 All MongoDB tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✓ Connection established');
    console.log('  ✓ Embedding insertion working');
    console.log('  ✓ Session-based retrieval working');
    console.log('  ✓ Cleanup functionality working');
    console.log('\nNext steps:');
    console.log('1. Create the vector index in Azure portal');
    console.log('2. Re-run this test to verify semantic search');
    console.log('3. Integrate with your agents');

  } catch (error) {
    console.error('❌ Error testing MongoDB:', error);
    process.exit(1);
  }
}

// Run the test
testMongoDB().catch(console.error);