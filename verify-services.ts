#!/usr/bin/env node
/**
 * Service Verification Script
 * 
 * This script verifies that all required services for the MisyBot AI Agent Platform are running properly.
 * It checks PostgreSQL, Redis, and MongoDB connections and provides detailed status information.
 */

import { createClient } from 'redis';
import { MongoClient } from 'mongodb';
import { Client } from 'pg';

async function checkPostgreSQL() {
  console.log('1. Checking PostgreSQL...');
  
  try {
    const pgClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
    });
    
    await pgClient.connect();
    console.log('✅ PostgreSQL is running and accessible');
    await pgClient.end();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL is not running or not accessible:', error.message);
    return false;
  }
}

async function checkRedis() {
  console.log('\n2. Checking Redis...');
  
  try {
    const isTLS = process.env.REDIS_TLS === 'true';
    const protocol = isTLS ? 'rediss' : 'redis';
    const redisClient = createClient({
      url: `${protocol}://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
      password: process.env.REDIS_PASSWORD,
      socket: isTLS ? {
        tls: true,
        rejectUnauthorized: false
      } : undefined
    });
    
    await redisClient.connect();
    console.log('✅ Redis is running and accessible');
    
    await redisClient.set('health-check', 'ok', { EX: 10 });
    const value = await redisClient.get('health-check');
    console.log('✅ Redis read/write working:', value);
    
    await redisClient.quit();
    console.log('✅ Redis connection test completed');
    return true;
  } catch (error) {
    console.error('❌ Redis is not running or not accessible:', error.message);
    return false;
  }
}

async function checkMongoDB() {
  console.log('\n3. Checking MongoDB...');
  
  try {
    const mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017');
    
    await mongoClient.connect();
    console.log('✅ MongoDB is running and accessible');
    
    const db = mongoClient.db(process.env.MONGODB_DB_NAME || 'misybot');
    await db.listCollections().toArray();
    console.log('✅ MongoDB database accessible');
    
    await mongoClient.close();
    console.log('✅ MongoDB connection test completed');
    return true;
  } catch (error) {
    console.error('❌ MongoDB is not running or not accessible:', error.message);
    return false;
  }
}

async function main() {
  console.log('MisyBot AI Agent Platform - Service Verification');
  console.log('==============================================\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  let allServicesRunning = true;
  
  // Check each service
  const postgresOK = await checkPostgreSQL();
  const redisOK = await checkRedis();
  const mongoOK = await checkMongoDB();
  
  allServicesRunning = postgresOK && redisOK && mongoOK;
  
  console.log('\n' + '='.repeat(50));
  if (allServicesRunning) {
    console.log('✅ All required services are running properly!');
    console.log('\nYou can now start the MisyBot AI Agent Platform:');
    console.log('1. Run "npm run start:dev" in the backend directory');
    console.log('2. Run "npm start" in the frontend directory');
    console.log('3. Access the application at http://localhost:3000');
  } else {
    console.log('❌ Some services are not running properly.');
    console.log('\nPlease ensure the following services are installed and running:');
    console.log('- PostgreSQL (port 5432)');
    console.log('- Redis (port 6379)');
    console.log('- MongoDB (port 27017)');
    console.log('\nYou can use Docker to run these services with the provided docker-compose.yml file:');
    console.log('docker-compose up -d');
  }
  console.log('='.repeat(50));
}

main().catch(console.error);