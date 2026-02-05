"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
const typeorm_1 = require("typeorm");
async function testDBConnection() {
    console.log('=== PRUEBA DE CONEXIÓN A BASE DE DATOS ===\n');
    console.log('Configuración de conexión:');
    console.log('- Host:', process.env.DB_HOST);
    console.log('- Port:', process.env.DB_PORT);
    console.log('- Username:', process.env.DB_USERNAME);
    console.log('- Database:', process.env.DB_NAME);
    console.log('- SSL:', process.env.DB_SSL);
    console.log('- Password presente:', !!process.env.DB_PASSWORD);
    console.log('');
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '1234',
        database: process.env.DB_NAME || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
        synchronize: false,
        logging: false,
        entities: []
    });
    try {
        console.log('1. Inicializando conexión...');
        await dataSource.initialize();
        console.log('✅ Conexión exitosa');
        console.log('\n2. Ejecutando consulta de prueba...');
        const result = await dataSource.query('SELECT version()');
        console.log('Versión de PostgreSQL:', result[0].version);
        console.log('\n3. Cerrando conexión...');
        await dataSource.destroy();
        console.log('✅ Conexión cerrada correctamente');
        console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error en la prueba:');
        console.error('- Mensaje:', error.message);
        console.error('- Código:', error.code);
        if (error.message.includes('no pg_hba.conf entry')) {
            console.error('\n💡 Posibles soluciones:');
            console.error('1. Verificar que la IP del cliente esté permitida en Azure PostgreSQL');
            console.error('2. Confirmar que las credenciales sean correctas');
            console.error('3. Validar que SSL esté configurado correctamente');
        }
        process.exit(1);
    }
}
testDBConnection();
//# sourceMappingURL=db-connection-test.js.map