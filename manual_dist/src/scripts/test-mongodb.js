#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_config_service_1 = require("../common/mongodb/mongo-config.service");
const mongo_vector_service_1 = require("../common/mongodb/mongo-vector.service");
async function testMongoDB() {
    console.log('   Testing MongoDB setup...');
    try {
        const mongoConfigService = new mongo_config_service_1.MongoConfigService();
        const vectorService = new mongo_vector_service_1.MongoVectorService(mongoConfigService);
        console.log('  Services initialized');
        console.log('\n   Test 1: Inserting sample embedding...');
        const sampleEmbedding = {
            sessionId: 'test-session-001',
            turnId: 'turn-001',
            role: 'user',
            text: 'Hello, this is a test message for vector search',
            embedding: Array(1536).fill(0.5),
            metadata: {
                agent: 'test-script',
                timestamp: new Date(),
                type: 'test-message',
            },
        };
        await vectorService.upsertEmbedding(sampleEmbedding);
        console.log('  Sample embedding inserted successfully');
        console.log('\n   Test 2: Inserting second embedding...');
        const similarEmbedding = {
            sessionId: 'test-session-001',
            turnId: 'turn-002',
            role: 'agent',
            text: 'Hi there, this is another test message',
            embedding: Array(1536).fill(0.51),
            metadata: {
                agent: 'test-script',
                timestamp: new Date(),
                type: 'test-response',
            },
        };
        await vectorService.upsertEmbedding(similarEmbedding);
        console.log('  Second embedding inserted successfully');
        console.log('\n   Test 3: Retrieving embeddings by session...');
        const sessionEmbeddings = await vectorService.getEmbeddingsBySession('test-session-001');
        console.log(`  Retrieved ${sessionEmbeddings.length} embeddings for session`);
        console.log('\n   Test 4: Testing semantic search...');
        try {
            const searchResults = await vectorService.semanticSearch(Array(1536).fill(0.49), 'test-session-001', { 'metadata.agent': 'test-script' }, 5, 0.1);
            console.log(`  Semantic search returned ${searchResults.length} results`);
        }
        catch (searchError) {
            console.log('    Semantic search test completed (may fail if vector index is not created yet)');
        }
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
    }
    catch (error) {
        console.error('  Error testing MongoDB:', error);
        process.exit(1);
    }
}
testMongoDB().catch(console.error);
//# sourceMappingURL=test-mongodb.js.map