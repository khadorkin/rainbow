import { getGlobal, saveGlobal } from './common';

const MIGRATION_VERSION = 'localmigrations';

const migrationsVersion = '0.0.1';

/**
 * @desc get migrations
 * @return {Object}
 */
export const getMigrationVersion = () =>
  getGlobal(MIGRATION_VERSION, [], migrationsVersion);

/**
 * @desc save migrations
 */
export const setMigrationVersion = migrations =>
  saveGlobal(MIGRATION_VERSION, migrations, migrationsVersion);
