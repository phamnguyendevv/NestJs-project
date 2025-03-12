import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommenttable11741429945562 implements MigrationInterface {
    name = 'AddCommenttable11741429945562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "updatedAt"`);
    }

}
