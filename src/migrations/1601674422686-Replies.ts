import {MigrationInterface, QueryRunner} from "typeorm";

export class Replies1601674422686 implements MigrationInterface {
    name = 'Replies1601674422686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "points" SET DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "points" SET DEFAULT 1`);
    }

}
