// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/growth-dna/:companyId
// Returns Growth DNA indices, signals, recent IoI events, and twin state
// for a given company (e.g. UB_RET_01, SAAS_01)
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import pool from '../lib/pgPool.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/growth-dna/:companyId', asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  // Validate — only alphanumeric + underscores
  if (!/^[A-Za-z0-9_]+$/.test(companyId)) {
    return res.status(400).json({ error: 'Invalid companyId' });
  }

  const client = await pool.connect();
  try {
    const [
      companyResult,
      latestDnaResult,
      dnaHistoryResult,
      signalsResult,
      eventsResult,
      twinStateResult,
    ] = await Promise.all([
      // Company profile
      client.query(
        `SELECT company_id, company_name, industry, sector, revenue_usd, employees, founded_year, regions, channels
         FROM company_profiles WHERE company_id = $1`,
        [companyId]
      ),
      // Latest Growth DNA snapshot
      client.query(
        `SELECT * FROM growth_dna_indices
         WHERE company_id = $1
         ORDER BY timestamp DESC LIMIT 1`,
        [companyId]
      ),
      // Last 5 snapshots for trend
      client.query(
        `SELECT snapshot_id, timestamp, growth_velocity_index, execution_efficiency_index,
                capital_efficiency_index, resilience_index, innovation_index, overall_dna_score
         FROM growth_dna_indices
         WHERE company_id = $1
         ORDER BY timestamp DESC LIMIT 5`,
        [companyId]
      ),
      // Current signals
      client.query(
        `SELECT signal_name, normalized_value, raw_value, signal_category, impact_level, timestamp
         FROM normalized_signals
         WHERE company_id = $1
         ORDER BY timestamp DESC`,
        [companyId]
      ),
      // Recent IoI events (last 24 hours)
      client.query(
        `SELECT event_id, timestamp, source_system, domain, event_type, event_subtype,
                entity_id, actor_type, raw_value, unit, severity,
                revenue_impact_flag, profit_impact_flag, metadata
         FROM ioi_events_unified
         WHERE company_id = $1
           AND timestamp > NOW() - INTERVAL '24 hours'
         ORDER BY timestamp DESC LIMIT 50`,
        [companyId]
      ),
      // Latest digital twin state
      client.query(
        `SELECT * FROM digital_twin_state
         WHERE company_id = $1
         ORDER BY timestamp DESC LIMIT 1`,
        [companyId]
      ),
    ]);

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: `Company '${companyId}' not found` });
    }

    return res.json({
      company:      companyResult.rows[0],
      growthDna:    latestDnaResult.rows[0] || null,
      dnaHistory:   dnaHistoryResult.rows,
      signals:      signalsResult.rows,
      recentEvents: eventsResult.rows,
      twinState:    twinStateResult.rows[0] || null,
      meta: {
        companyId,
        fetchedAt: new Date().toISOString(),
        eventCount: eventsResult.rows.length,
        signalCount: signalsResult.rows.length,
      },
    });
  } catch (err) {
    if (err?.code === '42P01') {
      return res.status(503).json({
        error: 'Growth DNA tables are not available yet. Run the seed script first.',
      });
    }
    throw err;
  } finally {
    client.release();
  }
}));

// GET /api/v1/growth-dna  — list all companies with latest DNA score
router.get('/growth-dna', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT DISTINCT ON (g.company_id)
        g.company_id, cp.company_name, cp.industry, cp.sector,
        g.overall_dna_score, g.growth_velocity_index, g.execution_efficiency_index,
        g.capital_efficiency_index, g.resilience_index, g.innovation_index, g.timestamp
      FROM growth_dna_indices g
      LEFT JOIN company_profiles cp ON cp.company_id = g.company_id
      ORDER BY g.company_id, g.timestamp DESC
    `);
    return res.json({ companies: rows, count: rows.length });
  } catch (err) {
    if (err?.code === '42P01') {
      return res.status(503).json({
        error: 'Growth DNA tables are not available yet. Run the seed script first.',
      });
    }
    throw err;
  } finally {
    client.release();
  }
}));

export default router;
