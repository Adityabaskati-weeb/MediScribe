import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mediscribe.db');

export function initializeLocalDatabase() {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS offline_queue (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL, synced INTEGER DEFAULT 0);'
    );
  });
}

export function enqueueOfflinePayload(id: string, payload: unknown) {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT OR REPLACE INTO offline_queue (id, payload, created_at, synced) VALUES (?, ?, ?, 0);',
      [id, JSON.stringify(payload), new Date().toISOString()]
    );
  });
}

export function getPendingOfflinePayloads(): Promise<Array<{ id: string; payload: unknown; created_at: string }>> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT id, payload, created_at FROM offline_queue WHERE synced = 0 ORDER BY created_at ASC;',
        [],
        (_, result) => {
          const rows: Array<{ id: string; payload: unknown; created_at: string }> = [];
          for (let index = 0; index < result.rows.length; index += 1) {
            const row = result.rows.item(index);
            rows.push({ id: row.id, payload: JSON.parse(row.payload), created_at: row.created_at });
          }
          resolve(rows);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export function markOfflinePayloadsSynced(ids: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ids.length === 0) {
      resolve();
      return;
    }

    db.transaction((tx) => {
      for (const id of ids) {
        tx.executeSql('UPDATE offline_queue SET synced = 1 WHERE id = ?;', [id]);
      }
    }, reject, () => resolve());
  });
}
