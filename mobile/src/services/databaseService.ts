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
