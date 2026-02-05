"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.typeormConfig = void 0;
const typeorm_1 = require("typeorm");
exports.typeormConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
    entities: [
        'dist/src/entities/*.entity.js',
        'dist/src/agents/*/*/entities/*.entity.js',
        'dist/src/oauth/entities/*.entity.js'
    ],
    migrations: ['dist/migrations/*{.ts,.js}', 'src/migrations/*.ts'],
    synchronize: false,
};
exports.AppDataSource = new typeorm_1.DataSource(exports.typeormConfig);
//# sourceMappingURL=typeorm-config.js.map