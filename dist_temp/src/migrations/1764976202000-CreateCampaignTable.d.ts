import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateCampaignTable1764976202000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
