#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_config_service_1 = require("../common/mongodb/mongo-config.service");
const mongo_vector_service_1 = require("../common/mongodb/mongo-vector.service");
async function initializeMongoDB() {
    console.log('   Initializing MongoDB for MisyBot...');
    try {
        const mongoConfigService = new mongo_config_service_1.MongoConfigService();
        const db = await mongoConfigService.getDb();
        if (!db) {
            console.error('  Failed to connect to MongoDB');
            process.exit(1);
            return;
        }
        console.log('  Connected to MongoDB');
        const collectionName = process.env.MONGODB_COLLECTION_EMBEDDINGS || 'embeddings';
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some(col => col.name === collectionName);
        if (!collectionExists) {
            await db.createCollection(collectionName);
            console.log(`  Created collection: ${collectionName}`);
        }
        else {
            console.log(`  Collection ${collectionName} already exists`);
        }
        const vectorService = new mongo_vector_service_1.MongoVectorService(mongoConfigService);
        await vectorService.createCompoundIndexes();
        console.log('  Created compound indexes');
        console.log('\n   NOTE ABOUT VECTOR INDEX:');
        console.log('For Cosmos DB MongoDB, vector indexes are typically created through the Azure portal.');
        console.log('Please create a vector index on the "embedding" field with the following settings:');
        console.log('- Path: embedding');
        console.log('- Dimensions: 1536 (adjust based on your embedding model)');
        console.log('- Similarity: cosine');
        console.log('- Index name: vector_index');
        const collection = db.collection(collectionName);
        const sampleDoc = {
            sessionId: 'test-session',
            role: 'user',
            text: 'Sample embedding for testing',
            embedding: Array(1536).fill(0.1),
            metadata: {
                agent: 'setup-script',
                timestamp: new Date(),
                type: 'test',
            },
        };
        await collection.insertOne(sampleDoc);
        console.log('  Successfully inserted test document');
        await collection.deleteOne({ sessionId: 'test-session' });
        console.log('  Cleaned up test document');
        console.log('\n   MongoDB initialization completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Create the vector index in Azure portal as described above');
        console.log('2. Verify the connection by running the test script');
        console.log('3. Start using the MongoVectorService in your agents');
    }
    catch (error) {
        console.error('  Error initializing MongoDB:', error);
        process.exit(1);
    }
}
initializeMongoDB().catch(console.error);
//# sourceMappingURL=init-mongodb.js.map