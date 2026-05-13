// ─────────────────────────────────────────────────────────────────────────────
// seed-digital-twin.js  — creates demo tables + seeds data for the Render DB
// Run: node src/scripts/seed-digital-twin.js
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

// ── DDL ──────────────────────────────────────────────────────────────────────
const DDL = `
CREATE TABLE IF NOT EXISTS company_profiles (
    company_id      VARCHAR(50)  PRIMARY KEY,
    company_name    VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    sector          VARCHAR(100),
    revenue_usd     DECIMAL(15,2),
    employees       INTEGER,
    founded_year    INTEGER,
    regions         JSONB,
    channels        JSONB,
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_dna_indices (
    snapshot_id                  SERIAL PRIMARY KEY,
    company_id                   VARCHAR(50) NOT NULL,
    timestamp                    TIMESTAMP NOT NULL,
    growth_velocity_index        DECIMAL(5,2),
    execution_efficiency_index   DECIMAL(5,2),
    capital_efficiency_index     DECIMAL(5,2),
    resilience_index             DECIMAL(5,2),
    innovation_index             DECIMAL(5,2),
    overall_dna_score            DECIMAL(5,2),
    contributing_signals         JSONB,
    created_at                   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dna_company    ON growth_dna_indices(company_id);
CREATE INDEX IF NOT EXISTS idx_dna_timestamp  ON growth_dna_indices(timestamp);

CREATE TABLE IF NOT EXISTS normalized_signals (
    signal_id         SERIAL PRIMARY KEY,
    company_id        VARCHAR(50) NOT NULL,
    signal_name       VARCHAR(100),
    normalized_value  DECIMAL(5,4),
    raw_value         DECIMAL(15,4),
    timestamp         TIMESTAMP,
    signal_category   VARCHAR(50),
    impact_level      VARCHAR(20)
);
CREATE INDEX IF NOT EXISTS idx_signals_company    ON normalized_signals(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_name       ON normalized_signals(signal_name);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp  ON normalized_signals(timestamp);

CREATE TABLE IF NOT EXISTS ioi_events_unified (
    event_id             VARCHAR(50) PRIMARY KEY,
    company_id           VARCHAR(50) NOT NULL DEFAULT 'UB_RET_01',
    timestamp            TIMESTAMP NOT NULL,
    source_system        VARCHAR(50),
    domain               VARCHAR(50),
    event_type           VARCHAR(100),
    event_subtype        VARCHAR(100),
    entity_id            VARCHAR(100),
    actor_type           VARCHAR(50),
    raw_value            DECIMAL(15,2),
    unit                 VARCHAR(20),
    severity             VARCHAR(20),
    revenue_impact_flag  BOOLEAN DEFAULT false,
    profit_impact_flag   BOOLEAN DEFAULT false,
    metadata             JSONB
);
CREATE INDEX IF NOT EXISTS idx_ioi_company    ON ioi_events_unified(company_id);
CREATE INDEX IF NOT EXISTS idx_ioi_timestamp  ON ioi_events_unified(timestamp);
CREATE INDEX IF NOT EXISTS idx_ioi_source     ON ioi_events_unified(source_system);
CREATE INDEX IF NOT EXISTS idx_ioi_type       ON ioi_events_unified(event_type);

CREATE TABLE IF NOT EXISTS digital_twin_state (
    state_id                     SERIAL PRIMARY KEY,
    company_id                   VARCHAR(50) NOT NULL,
    timestamp                    TIMESTAMP NOT NULL,
    growth_velocity_index        DECIMAL(5,4),
    execution_efficiency_index   DECIMAL(5,4),
    capital_efficiency_index     DECIMAL(5,4),
    resilience_index             DECIMAL(5,4),
    innovation_index             DECIMAL(5,4),
    active_pain_score            DECIMAL(5,4),
    operational_load             DECIMAL(5,4),
    decision_latency_index       DECIMAL(5,4),
    transformation_readiness     DECIMAL(5,4),
    overall_health_score         DECIMAL(5,2),
    created_at                   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_twin_company    ON digital_twin_state(company_id);
CREATE INDEX IF NOT EXISTS idx_twin_timestamp  ON digital_twin_state(timestamp);

CREATE TABLE IF NOT EXISTS erp_sales_orders (
    order_id             VARCHAR(50) PRIMARY KEY,
    company_id           VARCHAR(20) DEFAULT 'UB_RET_01',
    customer_id          VARCHAR(50),
    city                 VARCHAR(100),
    order_date           TIMESTAMP,
    sku_id               VARCHAR(50),
    quantity             INTEGER,
    order_value          DECIMAL(12,2),
    discount_amount      DECIMAL(12,2),
    fulfillment_time_hours INTEGER,
    order_status         VARCHAR(50),
    return_flag          BOOLEAN,
    approval_time_hours  DECIMAL(6,2),
    escalation_flag      BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_erp_orders_date   ON erp_sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_erp_orders_status ON erp_sales_orders(order_status);

CREATE TABLE IF NOT EXISTS crm_customers (
    customer_id          VARCHAR(50) PRIMARY KEY,
    company_id           VARCHAR(20) DEFAULT 'UB_RET_01',
    acquisition_channel  VARCHAR(100),
    lifetime_value       DECIMAL(12,2),
    churn_risk_score     DECIMAL(5,4),
    repeat_purchase_rate DECIMAL(5,4),
    nps_score            INTEGER,
    created_date         TIMESTAMP,
    last_purchase_date   TIMESTAMP,
    total_orders         INTEGER
);

CREATE TABLE IF NOT EXISTS hr_employees (
    employee_id              VARCHAR(50) PRIMARY KEY,
    company_id               VARCHAR(20) DEFAULT 'UB_RET_01',
    role                     VARCHAR(100),
    department               VARCHAR(100),
    productivity_score       DECIMAL(5,4),
    attrition_risk           DECIMAL(5,4),
    hire_date                TIMESTAMP,
    manager_id               VARCHAR(50),
    decision_authority_level INTEGER,
    salary_band              VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS decision_events (
    decision_id            VARCHAR(50) PRIMARY KEY,
    company_id             VARCHAR(20) DEFAULT 'UB_RET_01',
    decision_type          VARCHAR(100),
    decision_owner_role    VARCHAR(100),
    urgency_level          VARCHAR(20),
    decision_latency_hours DECIMAL(6,2),
    escalation_required    BOOLEAN,
    outcome_quality_score  DECIMAL(5,4),
    timestamp              TIMESTAMP,
    value_usd              DECIMAL(15,2),
    approval_chain_length  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_decision_timestamp ON decision_events(timestamp);
`;

// ── DATA ─────────────────────────────────────────────────────────────────────
const DATA_STATEMENTS = [
  `INSERT INTO company_profiles (company_id, company_name, industry, sector, revenue_usd, employees, founded_year, regions, channels)
   VALUES
     ('UB_RET_01', 'UrbanBasket Retail',  'FMCG Commerce', 'FMCG',  680000000, 3200, 2018, '["India"]',           '["App","Web","Retail","Dark Stores"]'),
     ('SAAS_01',   'TechFlow SaaS',        'Software',       'SaaS',   42000000,  180, 2020, '["USA","Europe"]',    '["Web","API","Marketplace"]')
   ON CONFLICT (company_id) DO NOTHING`,

  `INSERT INTO growth_dna_indices (company_id, timestamp, growth_velocity_index, execution_efficiency_index, capital_efficiency_index, resilience_index, innovation_index, overall_dna_score)
   VALUES
     ('UB_RET_01', NOW(),                     78, 62, 71, 66, 74, 70.2),
     ('UB_RET_01', NOW() - INTERVAL '7 days',  76, 64, 69, 65, 72, 69.2),
     ('UB_RET_01', NOW() - INTERVAL '14 days', 74, 66, 68, 64, 71, 68.6),
     ('UB_RET_01', NOW() - INTERVAL '21 days', 75, 65, 70, 66, 73, 69.8),
     ('UB_RET_01', NOW() - INTERVAL '30 days', 77, 63, 71, 65, 74, 70.0)`,

  `INSERT INTO growth_dna_indices (company_id, timestamp, growth_velocity_index, execution_efficiency_index, capital_efficiency_index, resilience_index, innovation_index, overall_dna_score)
   VALUES
     ('SAAS_01', NOW(),                     85, 79, 83, 72, 91, 82.0),
     ('SAAS_01', NOW() - INTERVAL '7 days',  83, 77, 81, 70, 89, 80.0),
     ('SAAS_01', NOW() - INTERVAL '14 days', 80, 75, 80, 68, 87, 78.0),
     ('SAAS_01', NOW() - INTERVAL '21 days', 82, 76, 82, 71, 88, 79.8),
     ('SAAS_01', NOW() - INTERVAL '30 days', 79, 74, 79, 69, 86, 77.4)`,

  `INSERT INTO normalized_signals (company_id, signal_name, normalized_value, raw_value, timestamp, signal_category, impact_level)
   VALUES
     ('UB_RET_01', 'repeat_purchase_rate',         0.72, 0.68,  NOW(), 'revenue',     'high'),
     ('UB_RET_01', 'decision_latency',              0.55, 48,    NOW(), 'operational', 'medium'),
     ('UB_RET_01', 'sla_breach_rate',               0.65, 0.12,  NOW(), 'operational', 'high'),
     ('UB_RET_01', 'employee_productivity',         0.81, 0.78,  NOW(), 'people',      'medium'),
     ('UB_RET_01', 'capital_efficiency',            0.73, 2.40,  NOW(), 'financial',   'high'),
     ('UB_RET_01', 'innovation_spend',              0.68, 0.08,  NOW(), 'financial',   'medium'),
     ('UB_RET_01', 'order_velocity',                0.75, 850,   NOW(), 'revenue',     'high'),
     ('UB_RET_01', 'execution_dropoff_rate',        0.22, 0.784, NOW(), 'operational', 'critical'),
     ('UB_RET_01', 'escalation_rate',               0.74, 0.21,  NOW(), 'operational', 'high'),
     ('UB_RET_01', 'revenue_lag_days',              0.69, 12.8,  NOW(), 'revenue',     'high'),
     ('UB_RET_01', 'decision_backlog_hours',        0.58, 12.5,  NOW(), 'operational', 'high'),
     ('UB_RET_01', 'manual_prioritization_minutes', 0.25, 78,    NOW(), 'operational', 'high'),
     ('UB_RET_01', 'system_sync_lag_minutes',       0.40, 27,    NOW(), 'technical',   'medium'),
     ('UB_RET_01', 'cart_abandonment_rate',         0.72, 0.28,  NOW(), 'revenue',     'medium'),
     ('UB_RET_01', 'customer_churn_risk',           0.35, 0.18,  NOW(), 'revenue',     'medium')`,

  `INSERT INTO normalized_signals (company_id, signal_name, normalized_value, raw_value, timestamp, signal_category, impact_level)
   VALUES
     ('SAAS_01', 'repeat_purchase_rate',    0.88, 0.88, NOW(), 'revenue',     'high'),
     ('SAAS_01', 'decision_latency',         0.30, 22,   NOW(), 'operational', 'low'),
     ('SAAS_01', 'sla_breach_rate',          0.15, 0.03, NOW(), 'operational', 'low'),
     ('SAAS_01', 'employee_productivity',    0.92, 0.89, NOW(), 'people',      'high'),
     ('SAAS_01', 'capital_efficiency',       0.85, 3.80, NOW(), 'financial',   'high'),
     ('SAAS_01', 'innovation_spend',         0.90, 0.22, NOW(), 'financial',   'high'),
     ('SAAS_01', 'customer_churn_risk',      0.18, 0.07, NOW(), 'revenue',     'medium'),
     ('SAAS_01', 'execution_dropoff_rate',   0.10, 0.12, NOW(), 'operational', 'low')`,

  `INSERT INTO digital_twin_state (company_id, timestamp, growth_velocity_index, execution_efficiency_index, capital_efficiency_index, resilience_index, innovation_index, active_pain_score, operational_load, decision_latency_index, transformation_readiness, overall_health_score)
   VALUES ('UB_RET_01', NOW(), 0.78, 0.62, 0.71, 0.66, 0.74, 0.41, 0.83, 0.58, 0.65, 70.2)`,

  `INSERT INTO digital_twin_state (company_id, timestamp, growth_velocity_index, execution_efficiency_index, capital_efficiency_index, resilience_index, innovation_index, active_pain_score, operational_load, decision_latency_index, transformation_readiness, overall_health_score)
   VALUES ('SAAS_01', NOW(), 0.85, 0.79, 0.83, 0.72, 0.91, 0.12, 0.61, 0.30, 0.88, 82.0)`,

  `INSERT INTO ioi_events_unified (event_id, company_id, timestamp, source_system, domain, event_type, event_subtype, entity_id, actor_type, raw_value, unit, severity, revenue_impact_flag, profit_impact_flag, metadata)
   VALUES
     ('EVT_10001','UB_RET_01',NOW()-INTERVAL'19 hours 2 minutes', 'ERP',     'procurement','decision_delay',    'escalating_change', 'PO_001234', 'procurement_manager',22,     'hours',    'high',   true, true, '{"description":"PO approval took 22 hours"}'),
     ('EVT_10002','UB_RET_01',NOW()-INTERVAL'20 hours 51 minutes','CRM',     'customer',   'execution_dropoff', 'data_inconsistency','CUST_4521', 'sales_rep',          6,      'hours',    'medium', true, false,'{"description":"Data inconsistency delayed customer stage 6 hours"}'),
     ('EVT_10003','UB_RET_01',NOW()-INTERVAL'21 hours 45 minutes','HRMS',    'staffing',   'escalation',        'role_approval_delay','REQ_00456','hr_manager',         1,      'escalation','critical',false,true,'{"description":"Staffing escalated to CFO","escalated_to":"CFO"}'),
     ('EVT_10004','UB_RET_01',NOW()-INTERVAL'22 hours 40 minutes','WORKFLOW','operations', 'execution_dropoff', 'ticket_unresolved', 'WF_008821','support_agent',      4,      'days',     'high',   false,false,'{"description":"Ticket unresolved 4 days"}'),
     ('EVT_10005','UB_RET_01',NOW()-INTERVAL'23 hours 9 minutes', 'CRM',     'sales',      'opportunity',       'high_value_lead',   'CUST_9876','sales_executive',   1200000,'INR',      'medium', true, true, '{"description":"12 lakh opportunity with ABC Corp"}'),
     ('EVT_10006','UB_RET_01',NOW()-INTERVAL'5 hours',            'ERP',     'sales',      'order_created',     'premium_sku',       'ORD_05678','customer',          4500,   'INR',      'low',    true, true, '{}'),
     ('EVT_10007','UB_RET_01',NOW()-INTERVAL'8 hours',            'WORKFLOW','operations', 'escalation',        'priority_shift',    'WF_009234','ops_manager',       1,      'escalation','medium',false, true, '{}'),
     ('EVT_10008','UB_RET_01',NOW()-INTERVAL'11 hours',           'FINANCE', 'budget',     'approval_delay',    'awaiting_cfo',      'APPR_00892','finance_director', 18,     'hours',    'medium', false,true, '{}'),
     ('EVT_10009','UB_RET_01',NOW()-INTERVAL'14 hours',           'CRM',     'customer',   'cart_abandonment',  'payment_issue',     'CART_3421','customer',          2800,   'INR',      'low',    true, false,'{}'),
     ('EVT_10010','UB_RET_01',NOW()-INTERVAL'17 hours',           'LOGISTICS','delivery',  'sla_breach',        'traffic_delay',     'DEL_004521','driver',           45,     'minutes',  'medium', false,true, '{}')
   ON CONFLICT (event_id) DO NOTHING`,

  `INSERT INTO erp_sales_orders (order_id,customer_id,city,order_date,sku_id,quantity,order_value,discount_amount,fulfillment_time_hours,order_status,return_flag,approval_time_hours,escalation_flag)
   SELECT 'ORD_'||LPAD(gs::TEXT,5,'0'),'CUST_'||((random()*4999+1)::int),
     (ARRAY['Mumbai','Delhi','Bangalore','Hyderabad','Chennai'])[floor(random()*5+1)::int],
     NOW()-(random()*30||' days')::interval,'SKU_'||((random()*99+1)::int),(random()*10+1)::int,
     (random()*5000+500)::numeric(12,2),(random()*200)::numeric(12,2),(random()*48+2)::int,
     (ARRAY['completed','processing','escalated','returned'])[floor(random()*4+1)::int],
     random()<0.08,(random()*24+1)::numeric(6,2),random()<0.12
   FROM generate_series(1,20) gs ON CONFLICT DO NOTHING`,

  `INSERT INTO crm_customers (customer_id,acquisition_channel,lifetime_value,churn_risk_score,repeat_purchase_rate,nps_score,created_date,last_purchase_date,total_orders)
   SELECT 'CUST_'||gs,(ARRAY['organic','paid','referral','social'])[floor(random()*4+1)::int],
     (random()*50000+1000)::numeric(12,2),(random()*0.35)::numeric(5,4),(0.4+random()*0.6)::numeric(5,4),
     (random()*100-20)::int,NOW()-(random()*1000||' days')::interval,NOW()-(random()*90||' days')::interval,
     (random()*20+1)::int
   FROM generate_series(1,20) gs ON CONFLICT DO NOTHING`,

  `INSERT INTO hr_employees (employee_id,role,department,productivity_score,attrition_risk,hire_date,manager_id,decision_authority_level,salary_band)
   SELECT 'EMP_'||LPAD(gs::TEXT,5,'0'),
     (ARRAY['Data Analyst','Product Manager','Sales Manager','Operations Manager','Finance Analyst'])[floor(random()*5+1)::int],
     (ARRAY['Engineering','Product','Sales','Operations','Finance'])[floor(random()*5+1)::int],
     (0.65+random()*0.30)::numeric(5,4),(random()*0.35)::numeric(5,4),
     NOW()-(random()*1825||' days')::interval,'EMP_'||((random()*50+1)::int),(random()*5)::int,
     (ARRAY['L1','L2','L3','L4'])[floor(random()*4+1)::int]
   FROM generate_series(1,20) gs ON CONFLICT DO NOTHING`,

  `INSERT INTO decision_events (decision_id,decision_type,decision_owner_role,urgency_level,decision_latency_hours,escalation_required,outcome_quality_score,timestamp,value_usd,approval_chain_length)
   SELECT 'DEC_'||LPAD(gs::TEXT,5,'0'),
     (ARRAY['procurement','hiring','budget','product','ops'])[floor(random()*5+1)::int],
     (ARRAY['CFO','VP Operations','Director','Manager','Lead'])[floor(random()*5+1)::int],
     (ARRAY['low','medium','high','critical'])[floor(random()*4+1)::int],
     (random()*40+2)::numeric(6,2),random()<0.29,(0.5+random()*0.45)::numeric(5,4),
     NOW()-(random()*60||' days')::interval,(random()*500000+5000)::numeric(15,2),(random()*4+1)::int
   FROM generate_series(1,20) gs ON CONFLICT DO NOTHING`,
];

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to Render PostgreSQL\n');

  // 1. Create tables
  console.log('▶  Creating tables (IF NOT EXISTS)...');
  const ddlStmts = DDL.split(';').map(s => s.trim()).filter(s => s.length > 2);
  let ddlOk = 0;
  for (const stmt of ddlStmts) {
    try { await client.query(stmt); ddlOk++; }
    catch (err) { console.error(`  ❌ DDL: ${err.message.slice(0,100)}\n     → ${stmt.slice(0,80)}`); }
  }
  console.log(`   ✓  ${ddlOk}/${ddlStmts.length} DDL statements OK\n`);

  // 2. Insert data
  console.log('▶  Inserting data...');
  let dataOk = 0;
  for (const stmt of DATA_STATEMENTS) {
    try {
      const result = await client.query(stmt);
      const label = stmt.match(/INSERT INTO (\w+)/)?.[1] || 'unknown';
      console.log(`   ✓  ${label.padEnd(22)} (${result.rowCount ?? '?'} rows affected)`);
      dataOk++;
    } catch (err) {
      console.error(`  ❌ ${err.message.slice(0,120)}`);
    }
  }
  console.log(`\n   ✓  ${dataOk}/${DATA_STATEMENTS.length} data statements OK`);

  // 3. Verification
  console.log('\n📊  Row counts:');
  const checks = [
    ['company_profiles',    'SELECT COUNT(*) FROM company_profiles'],
    ['growth_dna_indices',  'SELECT COUNT(*) FROM growth_dna_indices'],
    ['ioi_events_unified',  'SELECT COUNT(*) FROM ioi_events_unified'],
    ['normalized_signals',  'SELECT COUNT(*) FROM normalized_signals'],
    ['digital_twin_state',  'SELECT COUNT(*) FROM digital_twin_state'],
    ['erp_sales_orders',    'SELECT COUNT(*) FROM erp_sales_orders'],
    ['crm_customers',       'SELECT COUNT(*) FROM crm_customers'],
    ['hr_employees',        'SELECT COUNT(*) FROM hr_employees'],
    ['decision_events',     'SELECT COUNT(*) FROM decision_events'],
  ];
  for (const [label, q] of checks) {
    try {
      const { rows } = await client.query(q);
      console.log(`   ${label.padEnd(24)} → ${rows[0].count} rows`);
    } catch (e) {
      console.log(`   ${label.padEnd(24)} → ❌ ${e.message.slice(0,60)}`);
    }
  }

  await client.end();
  console.log('\n✅  Seed complete!');
  console.log('\nDemo queries:');
  console.log('  SELECT * FROM company_profiles;');
  console.log('  SELECT * FROM growth_dna_indices ORDER BY timestamp DESC;');
  console.log('  SELECT COUNT(*) FROM ioi_events_unified;');
  console.log('\nAPI:');
  console.log('  GET http://localhost:4000/api/v1/growth-dna/UB_RET_01');
  console.log('  GET http://localhost:4000/api/v1/growth-dna/SAAS_01');
  console.log('  GET http://localhost:4000/api/v1/growth-dna');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
