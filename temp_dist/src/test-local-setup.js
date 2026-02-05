"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const redis_1 = require("redis");
const mongodb_1 = require("mongodb");
async function testLocalSetup() {
    console.log('Testing local setup...\n');
    try {
        console.log('1. Testing PostgreSQL connection...');
        await data_source_1.AppDataSource.initialize();
        console.log('  PostgreSQL connection successful\n');
    }
    catch (error) {
        console.error('  PostgreSQL connection failed:', error.message);
    }
    try {
        console.log('2. Testing Redis connection...');
        const redisClient = (0, redis_1.createClient)({
            url: 'redis://localhost:6379'
        });
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await redisClient.connect();
        console.log('  Redis connection successful');
        await redisClient.set('test-key', 'test-value', {
            EX: 60
        });
        console.log('  Redis set operation successful');
        const value = await redisClient.get('test-key');
        console.log('  Redis get operation successful:', value);
        await redisClient.quit();
        console.log('  Redis disconnection successful\n');
    }
    catch (error) {
        console.error('  Redis connection failed:', error.message);
    }
    try {
        console.log('3. Testing MongoDB connection...');
        const connectionString = 'mongodb://localhost:27017';
        const dbName = 'misybot';
        const mongoClient = new mongodb_1.MongoClient(connectionString);
        await mongoClient.connect();
        console.log('  MongoDB connection successful');
        const db = mongoClient.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log('  MongoDB collections retrieved:', collections.map(c => c.name));
        await mongoClient.close();
        console.log('  MongoDB disconnection successful\n');
    }
    catch (error) {
        console.error('  MongoDB connection failed:', error.message);
    }
    console.log('Local setup test completed!');
}
testLocalSetup().catch(console.error);
//# sourceMappingURL=test-local-setup.js.map