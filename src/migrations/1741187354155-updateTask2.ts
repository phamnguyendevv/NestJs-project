import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTask21741187354155 implements MigrationInterface {
  name = 'UpdateTask21741187354155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`,
    );
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "projectId"`);
    await queryRunner.query(`ALTER TABLE "task" ADD "user_id" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD "project_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "end_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_6ea2c1c13f01b7a383ebbeaebb0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_1f53e7ffe94530f9e0221224d29" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_1f53e7ffe94530f9e0221224d29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_6ea2c1c13f01b7a383ebbeaebb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "end_date" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "project_id"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "task" ADD "projectId" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD "userId" integer`);
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
