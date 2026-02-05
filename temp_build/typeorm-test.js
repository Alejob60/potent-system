"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./src/data-source");
async function testTypeORMConnection() {
    console.log('=== TypeORM Connection Test ===');
    try {
        console.log('🔄 Initializing TypeORM data source...');
        const dataSource = await (0, data_source_1.getAppDataSource)();
        console.log('🔄 Connecting to database via TypeORM...');
        await dataSource.initialize();
        console.log('✅ TypeORM successfully connected to database');
        console.log('🔍 Checking entity metadata...');
        const entityMetadata = dataSource.entityMetadatas.find(meta => meta.tableName === 'front_desk_conversations');
        if (entityMetadata) {
            console.log('✅ FrontDeskConversation entity loaded successfully');
            console.log('📋 Table name:', entityMetadata.tableName);
            console.log('📊 Column count:', entityMetadata.columns.length);
            console.log('📋 Columns:');
            entityMetadata.columns.forEach(column => {
                console.log(`  - ${column.propertyName} -> ${column.databaseName}`);
            });
        }
        else {
            console.log('❌ FrontDeskConversation entity not found in metadata');
        }
        console.log('🔍 Testing repository operations...');
        const repository = dataSource.getRepository('FrontDeskConversation');
        const count = await repository.count();
        console.log(`📊 FrontDeskConversation table contains ${count} records`);
        await dataSource.destroy();
        console.log('🎉 All TypeORM tests completed successfully!');
    }
    catch (error) {
        console.log('❌ TypeORM connection failed');
        console.log('Error Details:');
        console.log('- Message:', error.message);
        if (error.stack) {
            console.log('- Stack:', error.stack);
        }
        try {
            const dataSource = await (0, data_source_1.getAppDataSource)();
            if (dataSource.isInitialized) {
                await dataSource.destroy();
            }
        }
        catch (closeError) {
        }
    }
}
testTypeORMConnection();
//# sourceMappingURL=typeorm-test.js.map