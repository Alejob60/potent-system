import { getAppDataSource } from './src/data-source';

async function testTypeORMConnection() {
  console.log('=== TypeORM Connection Test ===');
  
  try {
    console.log('🔄 Initializing TypeORM data source...');
    const dataSource = await getAppDataSource();
    
    console.log('🔄 Connecting to database via TypeORM...');
    await dataSource.initialize();
    
    console.log('✅ TypeORM successfully connected to database');
    
    // Check if the entity is loaded
    console.log('🔍 Checking entity metadata...');
    const entityMetadata = dataSource.entityMetadatas.find(
      meta => meta.tableName === 'front_desk_conversations'
    );
    
    if (entityMetadata) {
      console.log('✅ FrontDeskConversation entity loaded successfully');
      console.log('📋 Table name:', entityMetadata.tableName);
      console.log('📊 Column count:', entityMetadata.columns.length);
      
      // List column names
      console.log('📋 Columns:');
      entityMetadata.columns.forEach(column => {
        console.log(`  - ${column.propertyName} -> ${column.databaseName}`);
      });
    } else {
      console.log('❌ FrontDeskConversation entity not found in metadata');
    }
    
    // Test repository operations
    console.log('🔍 Testing repository operations...');
    const repository = dataSource.getRepository('FrontDeskConversation');
    
    // Try to count records
    const count = await repository.count();
    console.log(`📊 FrontDeskConversation table contains ${count} records`);
    
    await dataSource.destroy();
    console.log('🎉 All TypeORM tests completed successfully!');
    
  } catch (error) {
    console.log('❌ TypeORM connection failed');
    console.log('Error Details:');
    console.log('- Message:', error.message);
    if (error.stack) {
      console.log('- Stack:', error.stack);
    }
    
    // Try to close data source if it was initialized
    try {
      const dataSource = await getAppDataSource();
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    } catch (closeError) {
      // Ignore close errors
    }
  }
}

testTypeORMConnection();