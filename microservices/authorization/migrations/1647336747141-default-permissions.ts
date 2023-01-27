/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MigrationInterface, QueryRunner } from 'typeorm';
import CONST from '@constants/index';
import { importPermissions } from './permissions/helpers';

export default class defaultPermissions1647336747141 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!CONST.MS_DEFAULT_PERMISSION_MIGRATION) {
      return;
    }

    await importPermissions(queryRunner.connection);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!CONST.MS_DEFAULT_PERMISSION_MIGRATION) {
      return;
    }

    await importPermissions(queryRunner.connection, true);
  }
}
