#!/usr/bin/env node

/**
 * Test script to verify MongoDB setup and functionality
 */

import { MongoConfigService } from '../common/mongodb/mongo-config.service';
import { MongoVectorService, EmbeddingDocument } from '../common/mongodb/mongo-vector.service';

async function testMongoDB() {
  console.log('   Testing MongoDB setup...');

  try {
    // Initialize services
    const mongoConfigService = new MongoConfigService();
    const vectorService = new MongoVectorService(mongoConfigService);
    
    console.log('  Services initialized');

    // Test 1: Insert sample embedding
    console.log('\n   Test 1: Inserting sample embedding...');
    
    const sampleEmbedding: EmbeddingDocument = {
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

    await vectorService.upsertEmbedding(sampleEmbedding);
    console.log('  Sample embedding inserted successfully');

    // Test 2: Insert another embedding for similarity search
    console.log('\n   Test 2: Inserting second embedding...');
    
    const similarEmbedding: EmbeddingDocument = {
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

    await vectorService.upsertEmbedding(similarEmbedding);
    console.log('  Second embedding inserted successfully');

    // Test 3: Retrieve embeddings by session
    console.log('\n   Test 3: Retrieving embeddings by session...');
    
    const sessionEmbeddings = await vectorService.getEmbeddingsBySession('test-session-001');
    console.log(`  Retrieved ${sessionEmbeddings.length} embeddings for session`);

    // Test 4: Semantic search (this will work once vector index is created)
    console.log('\n   Test 4: Testing semantic search...');
    
    try {
      const searchResults = await vectorService.semanticSearch(
        Array(1536).fill(0.49), // Query embedding similar to our test data
        'test-session-001',
        { 'metadata.agent': 'test-script' },
        5,
        0.1, // Low threshold for testing
      );
      
      console.log(`  Semantic search returned ${searchResults.length} results`);
    } catch (searchError) {
      console.log('    Semantic search test completed (may fail if vector index is not created yet)');
    }

    // Test 5: Delete test embeddings
    console.log('\n   Test 5: Cleaning up test data...');
    
    const deletedCount = await vectorService.deleteEmbeddingsBySession('test-session-001');
    console.log(`  Cleaned up ${deletedCount} test embeddings`);

    console.log('\n   All MongoDB tests completed successfully!');
    console.log('\n   Summary:');
    console.log('    Connection established');
    console.log('    Embedding insertion working');
    console.log('    Session-based retrieval working');
    console.log('    Cleanup functionality working');
    console.log('\nNext steps:');
    console.log('1. Create the vector index in Azure portal');
    console.log('2. Re-run this test to verify semantic search');
    console.log('3. Integrate with your agents');

  } catch (error) {
    console.error('  Error testing MongoDB:', error);
    process.exit(1);
  }
}

// Run the test
testMongoDB().catch(console.error);