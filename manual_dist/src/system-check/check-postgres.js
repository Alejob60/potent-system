"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_1 = require("./logger.util");
async function checkPostgres() {
    const { Client } = require('pg');
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
    let client;
    try {
        if (!config.host || !config.user || !config.password || !config.database) {
            throw new Error('DB_HOST, DB_USERNAME, DB_PASSWORD o DB_NAME no est n presentes en el entorno');
        }
        client = new Client(config);
        await client.connect();
        await client.query('SELECT NOW()');
        (0, logger_util_1.logSystemCheck)('Conexi n a PostgreSQL exitosa usando variables individuales', 'PostgreSQL', 'OK');
    }
    catch (error) {
        (0, logger_util_1.logSystemCheck)('Fallo de conexi n a PostgreSQL (variables individuales)', 'PostgreSQL', 'FAIL', error);
    }
    finally {
        if (client)
            await client.end();
    }
}
if (require.main === module) {
    checkPostgres();
}
//# sourceMappingURL=check-postgres.js.map