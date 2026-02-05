import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
export declare function createDataSourceOptions(): Promise<PostgresConnectionOptions>;
export declare function getAppDataSource(): Promise<DataSource>;
export declare const AppDataSource: DataSource;
