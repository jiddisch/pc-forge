#!/usr/bin/env node
/**
 * Insert a part into the local SQLite DB.
 *
 * Usage:
 *   npm run parts:add -- --category cpu --brand AMD --name "Ryzen 9 9950X" --price 549 \
 *     --specs '{"socket":"AM5","cores":16}' --imageUrl "https://..."
 */
import { openDb, insertPart, rowToPart } from '../db.mjs';
import { seedIfEmpty } from '../seed.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const VALID = new Set([
  'cpu',
  'motherboard',
  'memory',
  'storage',
  'gpu',
  'psu',
  'case',
  'cooling',
]);

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  console.log(`Usage: npm run parts:add -- --category <cat> --brand <b> --name <n> --price <n> [options]

Options:
  --category   one of: ${[...VALID].join('|')}
  --brand      brand name
  --name       part name
  --price      USD number
  --id         optional id (default: <category>-<slugified-name>)
  --specs      JSON object string
  --imageUrl   image URL
`);
  process.exit(0);
}

const category = args.category;
const brand = args.brand;
const name = args.name;
const price = Number(args.price);

if (!category || !VALID.has(category)) {
  console.error(`Error: --category required (${[...VALID].join('|')})`);
  process.exit(1);
}
if (!brand || !name) {
  console.error('Error: --brand and --name are required');
  process.exit(1);
}
if (Number.isNaN(price) || price < 0) {
  console.error('Error: --price must be a non-negative number');
  process.exit(1);
}

let specs = {};
if (args.specs) {
  try {
    specs = JSON.parse(args.specs);
  } catch (e) {
    console.error('Error: --specs must be valid JSON');
    process.exit(1);
  }
}

const id = args.id || `${category}-${slugify(name)}`;
const imageUrl =
  args.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(id)}/400/300`;

const db = openDb();
seedIfEmpty(db);

if (db.prepare('SELECT 1 FROM parts WHERE id = ?').get(id)) {
  console.error(`Error: part id already exists: ${id}`);
  process.exit(1);
}

const created = insertPart(db, { id, category, name, brand, price, specs, imageUrl });
console.log(JSON.stringify(created, null, 2));
db.close();
