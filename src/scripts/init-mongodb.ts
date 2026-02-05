#!/usr/bin/env node

/**
 * Script to initialize MongoDB collections and indexes for the MisyBot system
 * This script should be run once during initial setup
 */

import { MongoConfigService } from '../common/mongodb/mongo-config.service';
import { MongoVectorService } from '../common/mongodb/mongo-vector.service';

async function initializeMongoDB() {
  console.log('   Initializing MongoDB for MisyBot...');

  try {
    // Initialize MongoDB connection
    const mongoConfigService = new MongoConfigService();
    const db = await mongoConfigService.getDb();
    
    if (!db) {
      console.error('  Failed to connect to MongoDB');
      process.exit(1);
      return;
    }
    
    console.log('  Connected to MongoDB');

    // Create embeddings collection if it doesn't exist
    const collectionName = process.env.MONGODB_COLLECTION_EMBEDDINGS || 'embeddings';
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === collectionName);

    if (!collectionExists) {
      await db.createCollection(collectionName);
      console.log(`  Created collection: ${collectionName}`);
    } else {
      console.log(`  Collection ${collectionName} already exists`);
    }

    // Initialize vector service to create indexes
    const vectorService = new MongoVectorService(mongoConfigService);
    
    // Create compound indexes
    await vectorService.createCompoundIndexes();
    console.log('  Created compound indexes');

    // Note about vector index creation
    console.log('\n   NOTE ABOUT VECTOR INDEX:');
    console.log('For Cosmos DB MongoDB, vector indexes are typically created through the Azure portal.');
    console.log('Please create a vector index on the "embedding" field with the following settings:');
    console.log('- Path: embedding');
    console.log('- Dimensions: 1536 (adjust based on your embedding model)');
    console.log('- Similarity: cosine');
    console.log('- Index name: vector_index');

    // Test the connection by inserting a sample document
    const collection = db.collection(collectionName);
    const sampleDoc = {
      sessionId: 'test-session',
      role: 'user',
      text: 'Sample embedding for testing',
      embedding: Array(1536).fill(0.1), // Sample embedding
      metadata: {
        agent: 'setup-script',
        timestamp: new Date(),
        type: 'test',
      },
    };

    await collection.insertOne(sampleDoc);
    console.log('  Successfully inserted test document');

    // Clean up test document
    await collection.deleteOne({ sessionId: 'test-session' });
    console.log('  Cleaned up test document');

    console.log('\n   MongoDB initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create the vector index in Azure portal as described above');
    console.log('2. Verify the connection by running the test script');
    console.log('3. Start using the MongoVectorService in your agents');

  } catch (error) {
    console.error('  Error initializing MongoDB:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeMongoDB().catch(console.error);