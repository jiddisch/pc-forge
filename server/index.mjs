import express from 'express';
import cors from 'cors';
import { openDb, rowToPart, insertPart, countParts } from './db.mjs';
import { seedIfEmpty } from './seed.mjs';

const PREFERRED_PORT = Number(process.env.PORT) || 3000;
const FALLBACK_PORT = 3333;

const db = openDb();
const seedResult = seedIfEmpty(db);
console.log(
  seedResult.seeded
    ? `[pc-forge api] seeded ${seedResult.count} parts`
    : `[pc-forge api] db already has ${seedResult.count} parts`,
);

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'http://localhost:4201',
      'http://127.0.0.1:4201',
    ],
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, parts: countParts(db) });
});

app.get('/api/parts', (req, res) => {
  const category = req.query.category ? String(req.query.category) : null;
  const brand = req.query.brand ? String(req.query.brand) : null;
  const q = req.query.q ? String(req.query.q).toLowerCase() : null;
  const maxPriceRaw = req.query.maxPrice;
  const maxPrice =
    maxPriceRaw != null && maxPriceRaw !== '' ? Number(maxPriceRaw) : null;

  let sql = 'SELECT * FROM parts WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (brand) {
    sql += ' AND LOWER(brand) = LOWER(?)';
    params.push(brand);
  }
  if (maxPrice != null && !Number.isNaN(maxPrice)) {
    sql += ' AND price <= ?';
    params.push(maxPrice);
  }

  let rows = db.prepare(sql).all(...params).map(rowToPart);

  if (q) {
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        Object.values(p.specs).some((v) => String(v).toLowerCase().includes(q)),
    );
  }

  res.json({ items: rows, total: rows.length });
});

app.get('/api/parts/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: 'Part not found' });
  }
  res.json(rowToPart(row));
});

app.get('/api/categories', (_req, res) => {
  const rows = db.prepare('SELECT category, COUNT(*) AS n FROM parts GROUP BY category').all();
  const counts = {};
  for (const r of rows) counts[r.category] = r.n;
  res.json({ counts });
});

const VALID_CATEGORIES = new Set([
  'cpu',
  'motherboard',
  'memory',
  'storage',
  'gpu',
  'psu',
  'case',
  'cooling',
]);

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

app.post('/api/parts', (req, res) => {
  const body = req.body ?? {};
  const category = body.category;
  const name = body.name;
  const brand = body.brand;
  const price = Number(body.price);

  if (!category || !VALID_CATEGORIES.has(category)) {
    return res.status(400).json({ message: 'Invalid or missing category' });
  }
  if (!name || !brand) {
    return res.status(400).json({ message: 'name and brand are required' });
  }
  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ message: 'price must be a non-negative number' });
  }

  let id = body.id ? String(body.id) : `${category}-${slugify(name)}`;
  if (db.prepare('SELECT 1 FROM parts WHERE id = ?').get(id)) {
    return res.status(409).json({ message: `Part id already exists: ${id}` });
  }

  let specs = body.specs ?? {};
  if (typeof specs === 'string') {
    try {
      specs = JSON.parse(specs);
    } catch {
      return res.status(400).json({ message: 'specs must be valid JSON' });
    }
  }

  try {
    const created = insertPart(db, {
      id,
      category,
      name,
      brand,
      price,
      specs,
      imageUrl: body.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(id)}/400/300`,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to insert part' });
  }
});

function listen(port) {
  const server = app.listen(port, () => {
    console.log(`[pc-forge api] listening on http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === PREFERRED_PORT) {
      console.warn(`[pc-forge api] port ${PREFERRED_PORT} busy, trying ${FALLBACK_PORT}`);
      listen(FALLBACK_PORT);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

listen(PREFERRED_PORT);
