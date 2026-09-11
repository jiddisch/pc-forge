#!/usr/bin/env node
import { openDb } from './db.mjs';
import { seedIfEmpty, reseed } from './seed.mjs';

const db = openDb();
const force = process.argv.includes('--force');
const result = force ? reseed(db) : seedIfEmpty(db);
console.log(JSON.stringify(result, null, 2));
db.close();
