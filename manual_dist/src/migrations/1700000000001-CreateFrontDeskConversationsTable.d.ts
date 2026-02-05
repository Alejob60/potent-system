import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateFrontDeskConversationsTable implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
