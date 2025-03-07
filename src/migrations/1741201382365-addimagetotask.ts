import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addimagetotask1741201382365 implements MigrationInterface {
  name = 'Addimagetotask1741201382365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ADD "imageUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "imageThumbnailUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "imagePublicId" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_imagestatus_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "imageStatus" "public"."task_imagestatus_enum" DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "imageError" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageError"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageStatus"`);
    await queryRunner.query(`DROP TYPE "public"."task_imagestatus_enum"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imagePublicId"`);
    await queryRunner.query(
      `ALTER TABLE "task" DROP COLUMN "imageThumbnailUrl"`,
    );
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageUrl"`);
  }
}
