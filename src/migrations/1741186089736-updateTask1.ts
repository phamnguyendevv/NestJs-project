import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTask11741186089736 implements MigrationInterface {
  name = 'UpdateTask11741186089736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "project_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ADD "project_id" integer NOT NULL`,
    );
  }
}
