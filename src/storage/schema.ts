import { fail, type SQLiteConnection } from './ports.ts';
export const SHELL_DATABASE = 'hypergolic-shell-v1.db';
const owner = 'user TEXT NOT NULL, publisher TEXT NOT NULL, app TEXT NOT NULL';
export const TABLES: Readonly<Record<string, string>> = Object.freeze({
  app_versions: `CREATE TABLE app_versions (${owner}, version TEXT NOT NULL, PRIMARY KEY (user, publisher, app, version)) WITHOUT ROWID`,
  selected_versions: `CREATE TABLE selected_versions (${owner}, version TEXT NOT NULL, PRIMARY KEY (user, publisher, app), FOREIGN KEY (user, publisher, app, version) REFERENCES app_versions (user, publisher, app, version)) WITHOUT ROWID`,
  saved_strings: `CREATE TABLE saved_strings (${owner}, version TEXT NOT NULL, scope TEXT NOT NULL CHECK (scope IN ('shared', 'instance')), instance TEXT NOT NULL CHECK ((scope = 'shared' AND instance = '') OR (scope = 'instance' AND length(instance) BETWEEN 1 AND 80)), key TEXT NOT NULL CHECK (length(CAST(key AS BLOB)) BETWEEN 0 AND 1024), value TEXT NOT NULL CHECK (length(CAST(value AS BLOB)) <= 262144), PRIMARY KEY (user, publisher, app, version, scope, instance, key), FOREIGN KEY (user, publisher, app, version) REFERENCES app_versions (user, publisher, app, version)) WITHOUT ROWID`,
  update_receipts: `CREATE TABLE update_receipts (${owner}, receipt TEXT NOT NULL, previous_version TEXT NOT NULL, version TEXT NOT NULL, row_count INTEGER NOT NULL CHECK (row_count >= 0), byte_count INTEGER NOT NULL CHECK (byte_count >= 0), workspace_revision INTEGER CHECK (workspace_revision >= 0), PRIMARY KEY (user, publisher, app, receipt), UNIQUE (user, publisher, app, version), FOREIGN KEY (user, publisher, app, previous_version) REFERENCES app_versions (user, publisher, app, version), FOREIGN KEY (user, publisher, app, version) REFERENCES app_versions (user, publisher, app, version)) WITHOUT ROWID`,
  workspaces: 'CREATE TABLE workspaces (user TEXT PRIMARY KEY NOT NULL, revision INTEGER NOT NULL CHECK (revision >= 0), payload TEXT NOT NULL CHECK (length(CAST(payload AS BLOB)) <= 524288)) WITHOUT ROWID',
});
export async function configure(db: SQLiteConnection, platform: 'android' | 'ios'): Promise<void> {
  await db.execAsync('PRAGMA busy_timeout = 1000');
  const journal = await db.getAllAsync<{ journal_mode: string }>('PRAGMA journal_mode = WAL');
  if (journal.length !== 1 || journal[0]!.journal_mode !== 'wal') fail('STORAGE_FAILURE');
  await db.execAsync('PRAGMA synchronous = FULL');
  await db.execAsync('PRAGMA foreign_keys = ON');
  const sync = await db.getAllAsync<{ synchronous: number }>('PRAGMA synchronous');
  if (sync.length !== 1 || sync[0]!.synchronous !== 2) fail('STORAGE_FAILURE');
  const foreign = await db.getAllAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  if (foreign.length !== 1 || foreign[0]!.foreign_keys !== 1) fail('STORAGE_FAILURE');
  if (platform === 'ios') {
    await db.execAsync('PRAGMA fullfsync = ON');
    await db.execAsync('PRAGMA checkpoint_fullfsync = ON');
    const fsync = await db.getAllAsync<{ fullfsync: number }>('PRAGMA fullfsync');
    if (fsync.length !== 1 || fsync[0]!.fullfsync !== 1) fail('STORAGE_FAILURE');
    const checkpoint = await db.getAllAsync<{ checkpoint_fullfsync: number }>('PRAGMA checkpoint_fullfsync');
    if (checkpoint.length !== 1 || checkpoint[0]!.checkpoint_fullfsync !== 1) fail('STORAGE_FAILURE');
  }
}
export async function schema(db: SQLiteConnection): Promise<void> {
  const version = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version');
  if (version.length !== 1 || ![0, 1].includes(version[0]!.user_version)) fail('CORRUPT_STORAGE');
  const objects = await db.getAllAsync<{ type: string; name: string; sql: string }>("SELECT type, name, sql FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name");
  if (version[0]!.user_version === 0 && objects.length === 0) {
    // All definitions are fixed source constants, created on this same transaction/connection.
    await db.execAsync(Object.values(TABLES).join(';'));
    await db.execAsync('PRAGMA user_version = 1');
  } else if (version[0]!.user_version !== 1 || objects.length !== Object.keys(TABLES).length || objects.some(row => row.type !== 'table' || !Object.hasOwn(TABLES, row.name) || row.sql !== TABLES[row.name])) fail('CORRUPT_STORAGE');
  const failures = await db.getAllAsync('PRAGMA foreign_key_check');
  if (failures.length !== 0) fail('CORRUPT_STORAGE');
}
