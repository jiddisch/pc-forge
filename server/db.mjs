import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, 'data');
export const DB_PATH = path.join(DATA_DIR, 'pc-forge.db');

export function openDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS parts (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL NOT NULL,
      specs TEXT NOT NULL,
      imageUrl TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
    CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand);
  `);
  return db;
}

export function rowToPart(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    brand: row.brand,
    price: row.price,
    specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs,
    imageUrl: row.imageUrl,
  };
}

export function insertPart(db, part) {
  const stmt = db.prepare(`
    INSERT INTO parts (id, category, name, brand, price, specs, imageUrl)
    VALUES (@id, @category, @name, @brand, @price, @specs, @imageUrl)
  `);
  stmt.run({
    id: part.id,
    category: part.category,
    name: part.name,
    brand: part.brand,
    price: part.price,
    specs: JSON.stringify(part.specs ?? {}),
    imageUrl: part.imageUrl ?? '',
  });
  return rowToPart(db.prepare('SELECT * FROM parts WHERE id = ?').get(part.id));
}

export function countParts(db) {
  return db.prepare('SELECT COUNT(*) AS n FROM parts').get().n;
}
