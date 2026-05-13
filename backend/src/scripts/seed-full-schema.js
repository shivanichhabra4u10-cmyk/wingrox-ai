/**
 * seed-full-schema.js
 * Executes both SQL schema files against Render PostgreSQL:
 *  1) 01-universal-database-schema.sql  (base tables, signal taxonomy, etc.)
 *  2) urbanbasket-synthetic-database.sql (UrbanBasket connector tables + synthetic data)
 * Then prints row counts for all tables.
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.resolve(__dirname, '../../../frontend');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

/** Split SQL text into individual statements, skipping blank / comment-only ones */
function splitStatements(sql) {
  // Normalise line endings
  sql = sql.replace(/\r\n/g, '\n');

  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let inDollarQuote = false;
  let dollarTag = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    // Toggle dollar-quoting ($$…$$ or $tag$…$tag$)
    if (!inSingleQuote && ch === '$') {
      const rest = sql.slice(i);
      const match = rest.match(/^\$([^$]*)\$/);
      if (match) {
        const tag = match[0];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
          current += tag;
          i += tag.length - 1;
          continue;
        } else if (tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
          current += tag;
          i += tag.length - 1;
          continue;
        }
      }
    }

    // Toggle single-quote
    if (!inDollarQuote && ch === "'") {
      // Handle escaped quotes ''
      if (inSingleQuote && sql[i + 1] === "'") {
        current += "''";
        i++;
        continue;
      }
      inSingleQuote = !inSingleQuote;
    }

    // Split on semicolons outside quotes
    if (!inSingleQuote && !inDollarQuote && ch === ';') {
      const stmt = current.trim();
      // Strip leading comment/blank lines to check for actual SQL content
      const stripped = stmt.replace(/^(\s*(--[^\n]*)?\n)*/m, '').trim();
      if (stripped && !stripped.match(/^--\s*$/)) {
        statements.push(stmt + ';');
      }
      current = '';
    } else {
      current += ch;
    }
  }
  const last = current.trim();
  if (last && !last.match(/^--/)) statements.push(last);
  return statements;
}

async function runFile(filePath, label) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log(`   File: ${path.basename(filePath)}`);
  console.log(`${'═'.repeat(60)}`);

  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = splitStatements(sql);
  console.log(`   Found ${statements.length} statements\n`);

  let ok = 0, skipped = 0, failed = 0;
  const client = await pool.connect();
  try {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
      try {
        await client.query(stmt);
        ok++;
        process.stdout.write(`   ✓ [${i + 1}/${statements.length}] ${preview}\n`);
      } catch (err) {
        // Skip benign errors: already exists, duplicate key, etc.
        const benign = [
          '42P07', // table already exists
          '42710', // constraint already exists
          '23505', // unique violation (duplicate insert)
          '42701', // column already exists
          '42P01', // table not found (for DROP IF EXISTS, shouldn't happen but safe)
        ];
        if (benign.includes(err.code)) {
          skipped++;
          process.stdout.write(`   ⚠ [${i + 1}/${statements.length}] SKIP (${err.code}): ${preview}\n`);
        } else {
          failed++;
          console.error(`   ✗ [${i + 1}/${statements.length}] FAIL (${err.code}): ${err.message.split('\n')[0]}`);
          console.error(`      SQL: ${preview}`);
        }
      }
    }
  } finally {
    client.release();
  }

  console.log(`\n   Summary: ${ok} OK | ${skipped} skipped | ${failed} failed\n`);
  return { ok, skipped, failed };
}

async function printRowCounts() {
  const { rows } = await pool.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊  ALL TABLES — Row Counts');
  console.log(`${'═'.repeat(60)}`);

  for (const row of rows) {
    try {
      const r = await pool.query(`SELECT COUNT(*) FROM "${row.tablename}"`);
      const count = parseInt(r.rows[0].count, 10);
      const bar = '█'.repeat(Math.min(Math.floor(count / 500), 20));
      console.log(`   ${row.tablename.padEnd(45)} → ${String(count).padStart(7)} rows  ${bar}`);
    } catch {
      console.log(`   ${row.tablename.padEnd(45)} → (error reading)`);
    }
  }
  console.log();
}

async function main() {
  console.log('\n🚀  WinGroX ADT — Full Schema Seed');
  console.log(`   Target: ${process.env.DATABASE_URL?.replace(/:[^@]+@/, ':***@')}\n`);

  // Test connection
  const client = await pool.connect();
  console.log('✅  Connected to PostgreSQL');
  client.release();

  // Step 1: Universal schema (base tables, taxonomy, benchmarks)
  const f1 = path.join(SQL_DIR, '01-universal-database-schema.sql');
  await runFile(f1, 'Universal Database Schema');

  // Step 2: UrbanBasket synthetic data (connector tables + large inserts)
  const f2 = path.join(SQL_DIR, 'urbanbasket-synthetic-database.sql');
  await runFile(f2, 'UrbanBasket Synthetic Database');

  // Step 3: Print all tables + row counts
  await printRowCounts();

  await pool.end();
  console.log('✅  Done. Run `npx prisma db pull` then `npx prisma studio` to browse all tables.\n');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
