// Simple script to verify that our services can be imported correctly
console.log('Verifying service imports...');

try {
  // Try to import the main module
  const { AppModule } = require('../app.module');
  console.log('  AppModule imported successfully');
} catch (error) {
  console.error('  Failed to import AppModule:', error.message);
}

try {
  // Try to import services
  const { ContextBundleService } = require('../services/context-bundle/context-bundle.service');
  console.log('  ContextBundleService imported successfully');
} catch (error) {
  console.error('  Failed to import ContextBundleService:', error.message);
}

try {
  const { MongoVectorService } = require('../services/mongo-vector/mongo-vector.service');
  console.log('  MongoVectorService imported successfully');
} catch (error) {
  console.error('  Failed to import MongoVectorService:', error.message);
}

try {
  const { ServiceBusService } = require('../services/service-bus/service-bus.service');
  console.log('  ServiceBusService imported successfully');
} catch (error) {
  console.error('  Failed to import ServiceBusService:', error.message);
}

try {
  const { KeyVaultService } = require('../services/key-vault/key-vault.service');
  console.log('  KeyVaultService imported successfully');
} catch (error) {
  console.error('  Failed to import KeyVaultService:', error.message);
}

try {
  const { RedisService } = require('../common/redis/redis.service');
  console.log('  RedisService imported successfully');
} catch (error) {
  console.error('  Failed to import RedisService:', error.message);
}

console.log('Service verification complete.');