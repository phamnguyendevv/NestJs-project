import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTask1741185911884 implements MigrationInterface {
  name = 'UpdateTask1741185911884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ADD "status" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "start_date" TIMESTAMP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "start_date"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "status"`);
  }
}
