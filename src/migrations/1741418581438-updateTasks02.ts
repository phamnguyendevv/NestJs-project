import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTasks021741418581438 implements MigrationInterface {
    name = 'UpdateTasks021741418581438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_6ea2c1c13f01b7a383ebbeaebb0"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_1f53e7ffe94530f9e0221224d29"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "project_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageThumbnailUrl"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imagePublicId"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageStatus"`);
        await queryRunner.query(`DROP TYPE "public"."task_imagestatus_enum"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "imageError"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "descriptionText" character varying NOT NULL DEFAULT 'No description provided'`);
        await queryRunner.query(`ALTER TABLE "task" ADD "descriptionImage" text`);
        await queryRunner.query(`ALTER TABLE "task" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "endDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "task" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "task" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD "projectId" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "projectId"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "descriptionImage"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "descriptionText"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "imageError" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."task_imagestatus_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "task" ADD "imageStatus" "public"."task_imagestatus_enum" DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "task" ADD "imagePublicId" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ADD "imageThumbnailUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ADD "project_id" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD "start_date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD "end_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_1f53e7ffe94530f9e0221224d29" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_6ea2c1c13f01b7a383ebbeaebb0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
