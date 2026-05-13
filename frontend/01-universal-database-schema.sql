-- ═══════════════════════════════════════════════════════════════════════════
-- ADVANCED DIGITAL TWIN™ - UNIVERSAL DATABASE SCHEMA
-- Works for ANY company by changing connections only
-- Schema-flexible, industry-agnostic, signal-driven architecture
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 1: COMPANY PROFILES (Multi-Company Support)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE company_profiles (
    company_id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    sector VARCHAR(100),
    revenue_usd DECIMAL(15,2),
    employees INTEGER,
    founded_year INTEGER,
    regions JSONB,
    channels JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_industry ON company_profiles(industry);
CREATE INDEX idx_company_sector ON company_profiles(sector);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 2: SYSTEM CONNECTIONS (Dynamic Enterprise Integration)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE system_connections (
    connection_id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    system_type VARCHAR(50) NOT NULL, -- ERP, CRM, HRMS, etc.
    system_name VARCHAR(100),
    connection_config JSONB NOT NULL, -- DB credentials, API keys, etc.
    schema_mapping JSONB, -- Auto-detected field mappings
    connection_status VARCHAR(20) DEFAULT 'active',
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_connections_company ON system_connections(company_id);
CREATE INDEX idx_connections_type ON system_connections(system_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 3: UNIVERSAL SIGNAL TAXONOMY (The Heart of Scalability)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE signal_taxonomy (
    signal_id VARCHAR(50) PRIMARY KEY,
    signal_name VARCHAR(100) UNIQUE NOT NULL,
    signal_category VARCHAR(50) NOT NULL, -- decision, execution, burnout, revenue, learning, authority
    signal_type VARCHAR(50), -- behavioral, financial, operational
    leading_or_lagging VARCHAR(20), -- leading, lagging
    description TEXT,
    unit VARCHAR(20), -- %, hours, days, count
    frequency VARCHAR(20), -- real_time, hourly, daily
    normalization_method VARCHAR(50), -- min_max, z_score, percentile
    min_value DECIMAL(15,4),
    max_value DECIMAL(15,4),
    sector_benchmarks JSONB, -- {sector: benchmark_value}
    metadata JSONB
);

CREATE INDEX idx_signal_category ON signal_taxonomy(signal_category);
CREATE INDEX idx_signal_type ON signal_taxonomy(signal_type);

-- Pre-populate universal signals (These work for ALL companies)
INSERT INTO signal_taxonomy (signal_id, signal_name, signal_category, signal_type, leading_or_lagging, description, unit, frequency, normalization_method, min_value, max_value) VALUES
('SIG_001', 'decision_delay', 'decision', 'behavioral', 'leading', 'Time between decision request and decision made', 'hours', 'real_time', 'min_max', 0, 168),
('SIG_002', 'execution_dropoff_rate', 'execution', 'behavioral', 'lagging', 'Percentage of initiated processes that fail to complete', '%', 'daily', 'min_max', 0, 1),
('SIG_003', 'escalation_rate', 'authority', 'behavioral', 'leading', 'Frequency of issues escalating to higher authority', '%', 'real_time', 'min_max', 0, 1),
('SIG_004', 'revenue_conversion_lag', 'revenue', 'financial', 'lagging', 'Time from lead generation to revenue recognition', 'days', 'daily', 'min_max', 0, 90),
('SIG_005', 'repeat_purchase_rate', 'revenue', 'behavioral', 'leading', 'Percentage of customers making repeat purchases', '%', 'daily', 'min_max', 0, 1),
('SIG_006', 'employee_productivity', 'execution', 'operational', 'lagging', 'Average productivity score across workforce', 'score', 'daily', 'z_score', 0, 1),
('SIG_007', 'burnout_risk', 'burnout', 'behavioral', 'leading', 'Accumulated overtime and stress indicators', 'score', 'real_time', 'min_max', 0, 1),
('SIG_008', 'learning_failure_rate', 'learning', 'behavioral', 'lagging', 'Rate of repeated mistakes and issue recurrence', '%', 'daily', 'min_max', 0, 1),
('SIG_009', 'authority_concentration', 'authority', 'structural', 'leading', 'Degree of decision-making centralization', 'score', 'daily', 'min_max', 0, 1),
('SIG_010', 'capital_efficiency', 'financial', 'financial', 'lagging', 'ROI on deployed capital', 'ratio', 'monthly', 'min_max', 0, 10),
('SIG_011', 'sla_breach_rate', 'execution', 'operational', 'lagging', 'Percentage of SLA violations', '%', 'real_time', 'min_max', 0, 1),
('SIG_012', 'innovation_velocity', 'innovation', 'behavioral', 'leading', 'Rate of new initiative launches', 'count', 'monthly', 'percentile', 0, 100),
('SIG_013', 'approval_backlog', 'decision', 'operational', 'leading', 'Number of pending approvals', 'count', 'real_time', 'min_max', 0, 1000),
('SIG_014', 'churn_risk', 'revenue', 'behavioral', 'leading', 'Customer churn probability', 'score', 'daily', 'min_max', 0, 1),
('SIG_015', 'operational_load', 'execution', 'operational', 'lagging', 'Current capacity utilization', '%', 'real_time', 'min_max', 0, 1.5);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 4: FIELD MAPPING ENGINE (Auto-Maps Enterprise Fields to Signals)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE field_signal_mappings (
    mapping_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    source_system VARCHAR(50),
    source_table VARCHAR(100),
    source_field VARCHAR(100),
    signal_id VARCHAR(50) REFERENCES signal_taxonomy(signal_id),
    transformation_logic TEXT, -- SQL expression or Python function
    confidence_score DECIMAL(3,2), -- 0-1, how confident is this mapping
    mapping_method VARCHAR(50), -- manual, semantic_match, ml_inferred
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_field_mappings_company ON field_signal_mappings(company_id);
CREATE INDEX idx_field_mappings_system ON field_signal_mappings(source_system);

-- Example mappings (UrbanBasket)
INSERT INTO field_signal_mappings (company_id, source_system, source_table, source_field, signal_id, transformation_logic, confidence_score, mapping_method) VALUES
('UB_RET_01', 'ERP', 'erp_sales_orders', 'approval_time_hours', 'SIG_001', 'AVG(approval_time_hours)', 0.95, 'semantic_match'),
('UB_RET_01', 'COMMERCE', 'commerce_orders', 'fulfillment_status', 'SIG_002', 'COUNT(CASE WHEN fulfillment_status LIKE ''dropoff%'' THEN 1 END) / COUNT(*)', 0.98, 'manual'),
('UB_RET_01', 'WORKFLOW', 'workflow_events', 'escalation_flag', 'SIG_003', 'COUNT(CASE WHEN escalation_flag THEN 1 END) / COUNT(*)', 0.97, 'semantic_match'),
('UB_RET_01', 'CRM', 'crm_customers', 'repeat_purchase_rate', 'SIG_005', 'AVG(repeat_purchase_rate)', 1.00, 'manual'),
('UB_RET_01', 'HRMS', 'hr_employees', 'productivity_score', 'SIG_006', 'AVG(productivity_score)', 0.99, 'semantic_match');

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 5: IoI EVENTS (Universal Event Stream)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE ioi_events_unified (
    event_id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    timestamp TIMESTAMP NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    source_connection_id VARCHAR(50) REFERENCES system_connections(connection_id),
    domain VARCHAR(50),
    event_type VARCHAR(100) NOT NULL,
    event_subtype VARCHAR(100),
    entity_id VARCHAR(100),
    entity_type VARCHAR(50),
    actor_type VARCHAR(50),
    actor_id VARCHAR(100),
    raw_value DECIMAL(15,4),
    unit VARCHAR(20),
    severity VARCHAR(20),
    revenue_impact_flag BOOLEAN DEFAULT false,
    profit_impact_flag BOOLEAN DEFAULT false,
    valuation_impact_flag BOOLEAN DEFAULT false,
    reputation_impact_flag BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ioi_company ON ioi_events_unified(company_id);
CREATE INDEX idx_ioi_timestamp ON ioi_events_unified(timestamp);
CREATE INDEX idx_ioi_source ON ioi_events_unified(source_system);
CREATE INDEX idx_ioi_type ON ioi_events_unified(event_type);
CREATE INDEX idx_ioi_severity ON ioi_events_unified(severity);

-- Partitioning for scale (partition by company_id and month)
-- CREATE TABLE ioi_events_unified_202605 PARTITION OF ioi_events_unified
-- FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 6: NORMALIZED SIGNALS (The Intelligence Layer)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE normalized_signals (
    signal_record_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    signal_id VARCHAR(50) REFERENCES signal_taxonomy(signal_id),
    signal_name VARCHAR(100),
    normalized_value DECIMAL(5,4) NOT NULL, -- 0-1 range
    raw_value DECIMAL(15,4),
    timestamp TIMESTAMP NOT NULL,
    signal_category VARCHAR(50),
    impact_level VARCHAR(20), -- low, medium, high, critical
    contributing_events JSONB, -- Array of event_ids that contributed
    computation_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signals_company ON normalized_signals(company_id);
CREATE INDEX idx_signals_signal ON normalized_signals(signal_id);
CREATE INDEX idx_signals_timestamp ON normalized_signals(timestamp);
CREATE INDEX idx_signals_category ON normalized_signals(signal_category);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 7: SIGNAL AGGREGATIONS (Time-Series Intelligence)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE signal_time_series (
    ts_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    signal_id VARCHAR(50) REFERENCES signal_taxonomy(signal_id),
    time_bucket TIMESTAMP NOT NULL, -- Hourly, daily, weekly buckets
    aggregation_type VARCHAR(20), -- avg, sum, count, max, min
    value DECIMAL(15,4),
    sample_count INTEGER,
    variance DECIMAL(15,6),
    trend_direction VARCHAR(10), -- up, down, stable
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ts_company_signal ON signal_time_series(company_id, signal_id);
CREATE INDEX idx_ts_time_bucket ON signal_time_series(time_bucket);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 8: GROWTH DNA INDICES (The Structural Intelligence)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE growth_dna_indices (
    snapshot_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    timestamp TIMESTAMP NOT NULL,
    
    -- The 5 Core Indices (0-100 scale)
    growth_velocity_index DECIMAL(5,2) NOT NULL,
    execution_efficiency_index DECIMAL(5,2) NOT NULL,
    capital_efficiency_index DECIMAL(5,2) NOT NULL,
    resilience_index DECIMAL(5,2) NOT NULL,
    innovation_index DECIMAL(5,2) NOT NULL,
    
    -- Composite Score
    overall_dna_score DECIMAL(5,2),
    
    -- Metadata
    contributing_signals JSONB, -- Which signals contributed to each index
    computation_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dna_company ON growth_dna_indices(company_id);
CREATE INDEX idx_dna_timestamp ON growth_dna_indices(timestamp);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 9: GROWTH DNA CONFIGURATION (How Signals Map to Indices)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE growth_dna_mapping (
    mapping_id SERIAL PRIMARY KEY,
    index_name VARCHAR(100) NOT NULL, -- growth_velocity_index, etc.
    signal_id VARCHAR(50) REFERENCES signal_taxonomy(signal_id),
    weight DECIMAL(5,4) NOT NULL, -- 0-1
    impact_direction VARCHAR(10), -- positive, negative
    sector VARCHAR(100), -- Sector-specific weights (optional)
    notes TEXT
);

CREATE INDEX idx_dna_mapping_index ON growth_dna_mapping(index_name);
CREATE INDEX idx_dna_mapping_signal ON growth_dna_mapping(signal_id);

-- Universal mappings (work for all companies)
INSERT INTO growth_dna_mapping (index_name, signal_id, weight, impact_direction) VALUES
-- Growth Velocity Index
('growth_velocity_index', 'SIG_004', 0.30, 'negative'), -- revenue_conversion_lag (faster = better)
('growth_velocity_index', 'SIG_005', 0.25, 'positive'), -- repeat_purchase_rate
('growth_velocity_index', 'SIG_012', 0.20, 'positive'), -- innovation_velocity
('growth_velocity_index', 'SIG_014', 0.25, 'negative'), -- churn_risk

-- Execution Efficiency Index
('execution_efficiency_index', 'SIG_002', 0.35, 'negative'), -- execution_dropoff_rate
('execution_efficiency_index', 'SIG_001', 0.25, 'negative'), -- decision_delay
('execution_efficiency_index', 'SIG_011', 0.20, 'negative'), -- sla_breach_rate
('execution_efficiency_index', 'SIG_006', 0.20, 'positive'), -- employee_productivity

-- Capital Efficiency Index
('capital_efficiency_index', 'SIG_010', 0.60, 'positive'), -- capital_efficiency
('capital_efficiency_index', 'SIG_004', 0.40, 'negative'), -- revenue_conversion_lag

-- Resilience Index
('resilience_index', 'SIG_008', 0.40, 'negative'), -- learning_failure_rate
('resilience_index', 'SIG_007', 0.30, 'negative'), -- burnout_risk
('resilience_index', 'SIG_014', 0.30, 'negative'), -- churn_risk

-- Innovation Index
('innovation_index', 'SIG_012', 0.70, 'positive'), -- innovation_velocity
('innovation_index', 'SIG_007', 0.30, 'negative'); -- burnout_risk (can't innovate if burned out)

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 10: PAIN INTELLIGENCE HUB (Structural Problem Detection)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE pain_patterns (
    pattern_id VARCHAR(50) PRIMARY KEY,
    pattern_name VARCHAR(200) NOT NULL,
    pattern_signature JSONB NOT NULL, -- Signal combination that indicates this pain
    root_cause TEXT,
    impacted_index VARCHAR(100), -- Which Growth DNA index this affects most
    severity_threshold DECIMAL(5,4), -- When to trigger alert
    recurrence_window_days INTEGER,
    recommended_intervention TEXT,
    metadata JSONB
);

INSERT INTO pain_patterns (pattern_id, pattern_name, pattern_signature, root_cause, impacted_index, severity_threshold) VALUES
('PAIN_001', 'Fragmented Ownership', '{"decision_delay": ">0.70", "execution_dropoff_rate": ">0.60", "escalation_rate": ">0.20"}', 'No single owner for end-to-end processes', 'execution_efficiency_index', 0.75),
('PAIN_002', 'Decision Bottleneck', '{"decision_delay": ">0.75", "approval_backlog": ">0.65"}', 'Manual approval workflows creating delays', 'growth_velocity_index', 0.70),
('PAIN_003', 'Execution Instability', '{"execution_dropoff_rate": ">0.70", "sla_breach_rate": ">0.15"}', 'System integration failures and process breakdowns', 'execution_efficiency_index', 0.80),
('PAIN_004', 'Authority Centralization', '{"authority_concentration": ">0.75", "escalation_rate": ">0.25"}', 'Too much decision power at top, bottleneck at leadership', 'capital_efficiency_index', 0.70),
('PAIN_005', 'Learning Failure Loop', '{"learning_failure_rate": ">0.40"}', 'Repeated mistakes, no systematic learning from failures', 'resilience_index', 0.65),
('PAIN_006', 'Burnout Accumulation', '{"burnout_risk": ">0.60", "employee_productivity": "<0.70"}', 'Sustained overtime and stress without recovery', 'innovation_index', 0.75);

CREATE TABLE detected_pains (
    detection_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    pattern_id VARCHAR(50) REFERENCES pain_patterns(pattern_id),
    severity_score DECIMAL(5,2), -- 0-10 scale
    first_detected TIMESTAMP,
    last_detected TIMESTAMP,
    frequency_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active', -- active, resolved, monitoring
    contributing_signals JSONB,
    recommended_actions JSONB
);

CREATE INDEX idx_pains_company ON detected_pains(company_id);
CREATE INDEX idx_pains_pattern ON detected_pains(pattern_id);
CREATE INDEX idx_pains_status ON detected_pains(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 11: DIGITAL TWIN STATE (Live Organizational Snapshot)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE digital_twin_state (
    state_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    timestamp TIMESTAMP NOT NULL,
    
    -- Growth DNA Indices (from growth_dna_indices)
    growth_velocity_index DECIMAL(5,4),
    execution_efficiency_index DECIMAL(5,4),
    capital_efficiency_index DECIMAL(5,4),
    resilience_index DECIMAL(5,4),
    innovation_index DECIMAL(5,4),
    
    -- Derived Metrics
    overall_health_score DECIMAL(5,2),
    active_pain_score DECIMAL(5,4),
    operational_load DECIMAL(5,4),
    decision_latency_index DECIMAL(5,4),
    transformation_readiness DECIMAL(5,4),
    
    -- Organizational Graph (optional - for Neo4j integration)
    org_graph_json JSONB,
    
    -- Metadata
    computation_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_twin_company ON digital_twin_state(company_id);
CREATE INDEX idx_twin_timestamp ON digital_twin_state(timestamp);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 12: SCENARIO LIBRARY (Pre-defined Intervention Scenarios)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE scenario_library (
    scenario_id VARCHAR(50) PRIMARY KEY,
    scenario_name VARCHAR(200) NOT NULL,
    scenario_type VARCHAR(50), -- growth, efficiency, transformation, risk_mitigation
    trigger_conditions JSONB, -- When to recommend this scenario
    intervention_type VARCHAR(100),
    affected_indices JSONB, -- Which indices this impacts
    intervention_strength DECIMAL(5,4), -- 0-1 multiplier
    duration_days INTEGER,
    capital_required DECIMAL(15,2),
    complexity_score INTEGER, -- 1-10
    success_probability DECIMAL(5,4), -- Historical success rate
    description TEXT,
    recommended_for JSONB -- Which company profiles benefit most
);

INSERT INTO scenario_library (scenario_id, scenario_name, scenario_type, intervention_type, affected_indices, intervention_strength, duration_days, capital_required, success_probability, description) VALUES
('SCEN_001', 'AI Automation Rollout', 'efficiency', 'ai_automation', '["execution_efficiency_index", "capital_efficiency_index"]', 0.30, 180, 5000000, 0.78, 'Deploy AI forecasting + workflow automation'),
('SCEN_002', 'Market Expansion', 'growth', 'geographic_expansion', '["growth_velocity_index", "resilience_index"]', 0.40, 365, 12000000, 0.65, 'Enter 3 new geographic markets'),
('SCEN_003', 'Cost Optimization', 'efficiency', 'cost_reduction', '["capital_efficiency_index", "execution_efficiency_index"]', 0.15, 120, 2000000, 0.82, 'Supply chain & logistics efficiency program'),
('SCEN_004', 'Authority Redistribution', 'structural', 'governance_change', '["growth_velocity_index", "execution_efficiency_index"]', 0.25, 90, 500000, 0.88, 'Redistribute decision authority, reduce bottlenecks'),
('SCEN_005', 'Learning Loop Implementation', 'capability', 'process_improvement', '["resilience_index", "execution_efficiency_index"]', 0.20, 180, 1000000, 0.75, 'Build systematic failure analysis and learning processes');

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 13: INTERVENTION EFFECTS (How Actions Impact Indices)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE intervention_effects (
    effect_id SERIAL PRIMARY KEY,
    intervention_type VARCHAR(100),
    impacted_index VARCHAR(100),
    effect_coefficient DECIMAL(6,4), -- Multiplier effect
    time_delay_days INTEGER, -- How long before effect shows
    uncertainty DECIMAL(5,4), -- Variance in effect (for Monte Carlo)
    decay_rate DECIMAL(5,4), -- How effect diminishes over time
    sector VARCHAR(100), -- Sector-specific (optional)
    evidence_strength DECIMAL(3,2) -- How confident we are (0-1)
);

INSERT INTO intervention_effects (intervention_type, impacted_index, effect_coefficient, time_delay_days, uncertainty, decay_rate, evidence_strength) VALUES
('ai_automation', 'execution_efficiency_index', 0.30, 60, 0.15, 0.05, 0.85),
('ai_automation', 'capital_efficiency_index', 0.25, 90, 0.18, 0.08, 0.78),
('geographic_expansion', 'growth_velocity_index', 0.40, 120, 0.25, 0.10, 0.70),
('cost_reduction', 'capital_efficiency_index', 0.20, 30, 0.10, 0.03, 0.90),
('governance_change', 'growth_velocity_index', 0.25, 45, 0.12, 0.04, 0.85),
('governance_change', 'execution_efficiency_index', 0.20, 60, 0.15, 0.05, 0.80);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 14: MONTE CARLO SIMULATION (The Prediction Engine)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE simulation_runs (
    run_id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    scenario_id VARCHAR(50) REFERENCES scenario_library(scenario_id),
    iteration_number INTEGER NOT NULL,
    random_seed INTEGER,
    
    -- Input State
    input_state JSONB, -- Initial Growth DNA indices
    input_variance DECIMAL(5,4),
    
    -- Output Predictions
    output_revenue DECIMAL(15,2),
    output_profit DECIMAL(15,2),
    output_margin DECIMAL(5,4),
    output_risk_score DECIMAL(5,4),
    
    -- Success Criteria
    success_flag BOOLEAN,
    success_criteria JSONB,
    
    -- Timestamps
    simulation_date TIMESTAMP DEFAULT NOW(),
    projection_end_date TIMESTAMP
);

CREATE INDEX idx_sim_company ON simulation_runs(company_id);
CREATE INDEX idx_sim_scenario ON simulation_runs(scenario_id);
CREATE INDEX idx_sim_iteration ON simulation_runs(scenario_id, iteration_number);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 15: SIMULATION TIME-STEPS (Day-by-Day Evolution)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE simulation_timesteps (
    timestep_id SERIAL PRIMARY KEY,
    run_id VARCHAR(50) REFERENCES simulation_runs(run_id),
    day_number INTEGER NOT NULL, -- 0-365
    
    -- Index values at this timestep
    growth_velocity DECIMAL(5,4),
    execution_efficiency DECIMAL(5,4),
    capital_efficiency DECIMAL(5,4),
    resilience DECIMAL(5,4),
    innovation DECIMAL(5,4),
    
    -- Business metrics
    revenue DECIMAL(15,2),
    profit DECIMAL(15,2),
    
    -- Events during this timestep
    events_occurred JSONB
);

CREATE INDEX idx_timesteps_run ON simulation_timesteps(run_id);
CREATE INDEX idx_timesteps_day ON simulation_timesteps(run_id, day_number);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 16: PROBABILITY DISTRIBUTIONS (Simulation Outcomes)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE simulation_distributions (
    distribution_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    scenario_id VARCHAR(50) REFERENCES scenario_library(scenario_id),
    metric_name VARCHAR(100), -- revenue, profit, risk, etc.
    
    -- Percentiles
    p10 DECIMAL(15,4),
    p25 DECIMAL(15,4),
    p50 DECIMAL(15,4),
    p75 DECIMAL(15,4),
    p90 DECIMAL(15,4),
    
    -- Statistics
    mean_value DECIMAL(15,4),
    median_value DECIMAL(15,4),
    std_dev DECIMAL(15,4),
    min_value DECIMAL(15,4),
    max_value DECIMAL(15,4),
    
    -- Success metrics
    success_probability DECIMAL(5,4),
    failure_probability DECIMAL(5,4),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dist_company_scenario ON simulation_distributions(company_id, scenario_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 17: BENCHMARKING (Cross-Company Intelligence)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE sector_benchmarks (
    benchmark_id SERIAL PRIMARY KEY,
    sector VARCHAR(100) NOT NULL,
    index_name VARCHAR(100) NOT NULL,
    signal_name VARCHAR(100),
    
    -- Benchmarks
    median_value DECIMAL(15,4),
    top_quartile DECIMAL(15,4),
    bottom_quartile DECIMAL(15,4),
    best_in_class DECIMAL(15,4),
    
    -- Sample size
    company_count INTEGER,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_benchmarks_sector ON sector_benchmarks(sector);

-- Sample benchmarks
INSERT INTO sector_benchmarks (sector, index_name, median_value, top_quartile, bottom_quartile, company_count) VALUES
('FMCG', 'growth_velocity_index', 65.0, 78.0, 52.0, 150),
('FMCG', 'execution_efficiency_index', 70.0, 82.0, 58.0, 150),
('FMCG', 'capital_efficiency_index', 68.0, 80.0, 55.0, 150),
('SaaS', 'growth_velocity_index', 72.0, 85.0, 60.0, 200),
('SaaS', 'execution_efficiency_index', 75.0, 88.0, 62.0, 200),
('BFSI', 'growth_velocity_index', 58.0, 70.0, 45.0, 100),
('BFSI', 'execution_efficiency_index', 78.0, 90.0, 65.0, 100);

CREATE TABLE company_vs_benchmark (
    comparison_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    index_name VARCHAR(100),
    company_value DECIMAL(5,2),
    benchmark_value DECIMAL(5,2),
    sector VARCHAR(100),
    percentile_rank DECIMAL(5,2), -- Where company falls (0-100)
    gap DECIMAL(6,2), -- company - benchmark
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comparison_company ON company_vs_benchmark(company_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 18: RECOMMENDED ROADMAPS (AI-Generated Action Plans)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE recommended_roadmaps (
    roadmap_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    generated_at TIMESTAMP DEFAULT NOW(),
    
    roadmap_steps JSONB, -- Array of sequenced actions
    total_duration_days INTEGER,
    total_capital_required DECIMAL(15,2),
    expected_dna_improvement JSONB, -- Expected index changes
    success_probability DECIMAL(5,4),
    
    status VARCHAR(20) DEFAULT 'proposed' -- proposed, accepted, in_progress, completed
);

CREATE TABLE roadmap_actions (
    action_id VARCHAR(50) PRIMARY KEY,
    roadmap_id INTEGER REFERENCES recommended_roadmaps(roadmap_id),
    step_number INTEGER,
    action_type VARCHAR(100),
    action_name VARCHAR(200),
    target_index VARCHAR(100),
    expected_impact DECIMAL(6,4),
    required_capital DECIMAL(15,2),
    execution_complexity INTEGER, -- 1-10
    timeline_days INTEGER,
    dependencies JSONB, -- Other actions that must complete first
    status VARCHAR(20) DEFAULT 'pending'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 19: EXPLAINABILITY (Trust & Transparency)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE prediction_explanations (
    explanation_id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(50), -- Reference to simulation or recommendation
    prediction_type VARCHAR(50), -- growth_forecast, pain_detection, etc.
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    
    -- Contributing factors
    contributing_signals JSONB, -- Top signals that influenced prediction
    signal_weights JSONB, -- How much each signal contributed
    confidence_score DECIMAL(5,4),
    confidence_reasoning TEXT,
    
    -- Sensitivity
    sensitivity_analysis JSONB, -- How much prediction changes with each input
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LAYER 20: LEARNING & CALIBRATION (Self-Improving System)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE prediction_vs_actual (
    comparison_id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES company_profiles(company_id),
    prediction_type VARCHAR(100),
    prediction_id VARCHAR(50),
    predicted_value DECIMAL(15,4),
    actual_value DECIMAL(15,4),
    variance DECIMAL(15,4),
    error_percentage DECIMAL(6,4),
    learning_weight DECIMAL(5,4), -- How much to adjust model
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE model_calibration (
    calibration_id SERIAL PRIMARY KEY,
    model_component VARCHAR(100), -- growth_dna, monte_carlo, pain_detection
    sector VARCHAR(100),
    calibration_factor DECIMAL(6,4),
    error_rate DECIMAL(6,4),
    last_updated TIMESTAMP DEFAULT NOW(),
    update_cycle_days INTEGER DEFAULT 30
);

-- ═══════════════════════════════════════════════════════════════════════════
-- UNIVERSAL VIEWS FOR DASHBOARD CONSUMPTION
-- ═══════════════════════════════════════════════════════════════════════════

-- Latest Growth DNA for each company
CREATE OR REPLACE VIEW latest_growth_dna AS
SELECT DISTINCT ON (company_id)
    company_id,
    timestamp,
    growth_velocity_index,
    execution_efficiency_index,
    capital_efficiency_index,
    resilience_index,
    innovation_index,
    overall_dna_score
FROM growth_dna_indices
ORDER BY company_id, timestamp DESC;

-- Active pains by company
CREATE OR REPLACE VIEW active_company_pains AS
SELECT 
    dp.company_id,
    pp.pattern_name,
    dp.severity_score,
    dp.frequency_count,
    pp.root_cause,
    pp.recommended_intervention
FROM detected_pains dp
JOIN pain_patterns pp ON dp.pattern_id = pp.pattern_id
WHERE dp.status = 'active'
ORDER BY dp.severity_score DESC;

-- Latest Digital Twin state
CREATE OR REPLACE VIEW latest_digital_twin AS
SELECT DISTINCT ON (company_id)
    company_id,
    timestamp,
    overall_health_score,
    active_pain_score,
    operational_load,
    decision_latency_index,
    transformation_readiness,
    growth_velocity_index,
    execution_efficiency_index,
    capital_efficiency_index,
    resilience_index,
    innovation_index
FROM digital_twin_state
ORDER BY company_id, timestamp DESC;

-- Signal summary by category
CREATE OR REPLACE VIEW signal_summary_by_category AS
SELECT 
    company_id,
    signal_category,
    COUNT(*) as signal_count,
    AVG(normalized_value) as avg_value,
    MAX(timestamp) as last_updated
FROM normalized_signals
GROUP BY company_id, signal_category;

-- ═══════════════════════════════════════════════════════════════════════════
-- SAMPLE COMPANY DATA (UrbanBasket)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO company_profiles (company_id, company_name, industry, sector, revenue_usd, employees, founded_year, regions, channels) VALUES
('UB_RET_01', 'UrbanBasket Retail', 'FMCG Commerce', 'FMCG', 680000000, 3200, 2018, '["India"]', '["App", "Web", "Retail", "Dark Stores"]');

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS (For API user)
-- ═══════════════════════════════════════════════════════════════════════════

-- CREATE USER adt_api WITH PASSWORD 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO adt_api;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO adt_api;

-- ═══════════════════════════════════════════════════════════════════════════
-- ANALYTICS & PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE system_performance_metrics (
    metric_id SERIAL PRIMARY KEY,
    module_name VARCHAR(100),
    operation VARCHAR(100),
    latency_ms INTEGER,
    throughput DECIMAL(10,2),
    error_rate DECIMAL(5,4),
    compute_cost DECIMAL(10,4),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLETE - UNIVERSAL SCHEMA READY
-- ═══════════════════════════════════════════════════════════════════════════
-- This schema works for:
-- • Any company (just add to company_profiles)
-- • Any industry (FMCG, SaaS, BFSI, Healthcare, etc.)
-- • Any enterprise systems (ERP, CRM, HRMS - all map to universal signals)
-- • Multi-company deployments (benchmarking across portfolio)
-- ═══════════════════════════════════════════════════════════════════════════
