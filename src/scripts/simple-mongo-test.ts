import { MongoClient } from 'mongodb';

async function testConnection() {
  const connectionString = process.env.MONGODB_CONNECTION_STRING || 'mongodb+srv://alejob600:Danielab6005901@%2F@misy-mongo.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';
  
  console.log('Testing MongoDB connection...');
  console.log('Connection string:', connectionString.substring(0, 50) + '...');

  try {
    const client = new MongoClient(connectionString, {
      maxIdleTimeMS: 120000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: false,
    });

    await client.connect();
    console.log('  Connected successfully to MongoDB');

    const db = client.db('misybot');
    console.log('  Database accessed successfully');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    await client.close();
    console.log('  Connection closed');
  } catch (error) {
    console.error('  Connection failed:', error);
  }
}

testConnection();