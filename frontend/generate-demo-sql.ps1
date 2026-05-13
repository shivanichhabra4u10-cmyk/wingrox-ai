$outFile = Join-Path $PSScriptRoot 'urbanbasket-demo-values.sql'
$lines = New-Object System.Collections.Generic.List[string]

function Add-InsertBlock {
  param(
    [string]$TableName,
    [string]$Columns,
    [object[]]$Rows
  )

  if (-not $Rows -or $Rows.Count -eq 0) {
    return
  }

  $null = $lines.Add("")
  $null = $lines.Add("INSERT INTO $TableName ($Columns) VALUES")
  for ($i = 0; $i -lt $Rows.Count; $i++) {
    $row = $Rows[$i]
    if ($i -lt ($Rows.Count - 1)) {
      $null = $lines.Add("$row,")
    } else {
      $null = $lines.Add("$row;")
    }
  }
}

$null = $lines.Add('-- TEMP DEMO SQL (frontend-only preview friendly)')
$null = $lines.Add('-- Keeps existing synthetic SQL untouched')
$null = $lines.Add('BEGIN;')

$channels = @('Organic','Paid Social','Google Ads','Referral','Direct')
$cities = @('Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune')
$statuses = @('completed','incomplete')
$eventTypes = @('cart_created','cart_abandoned','checkout_started','purchase_completed')
$roles = @('Software Engineer','Data Analyst','Product Manager','Sales Manager','HR Specialist')
$departments = @('Engineering','Product','Sales','Finance','HR')
$issueTypes = @('order_issue','payment_problem','delivery_delay','product_quality')
$severity = @('low','medium','high')

# CRM Customers (larger rowset for pagination demo)
$crmCustomers = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 260; $i++) {
  $id = 'CUST_{0:D4}' -f $i
  $ch = $channels[$i % $channels.Count]
  $ltv = [math]::Round(1200 + (($i * 137) % 49000), 2)
  $churn = [math]::Round((0.02 + (($i % 38) / 100.0)), 4).ToString('0.0000')
  $repeat = [math]::Round((0.55 + (($i % 26) / 100.0)), 4).ToString('0.0000')
  $nps = 30 + ($i % 41)
  $created = '2024-{0:D2}-{1:D2} 10:00:00' -f (($i % 12) + 1), (($i % 28) + 1)
  $last = '2025-{0:D2}-{1:D2} 12:00:00' -f (($i % 5) + 1), (($i % 28) + 1)
  $orders = 1 + ($i % 15)
  $null = $crmCustomers.Add("('$id','$ch',$ltv,$churn,$repeat,$nps,'$created','$last',$orders)")
}
Add-InsertBlock -TableName 'crm_customers' -Columns 'customer_id, acquisition_channel, lifetime_value, churn_risk_score, repeat_purchase_rate, nps_score, created_date, last_purchase_date, total_orders' -Rows $crmCustomers

# CRM Customer Events
$crmEvents = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 320; $i++) {
  $eid = 'EVT_CRM_{0:D5}' -f $i
  $cid = 'CUST_{0:D4}' -f (($i % 260) + 1)
  $et = $eventTypes[$i % $eventTypes.Count]
  $cart = [math]::Round(100 + (($i * 53) % 5000), 2)
  $abandon = if ($et -eq 'cart_abandoned') { 'true' } else { 'false' }
  $mins = 2 + ($i % 31)
  $ts = '2025-05-{0:D2} {1:D2}:15:00' -f (($i % 28) + 1), ($i % 24)
  $conv = if ($et -eq 'purchase_completed') { 'true' } else { 'false' }
  $null = $crmEvents.Add("('$eid','$cid','$et',$cart,$abandon,$mins,'$ts',$conv)")
}
Add-InsertBlock -TableName 'crm_customer_events' -Columns 'event_id, customer_id, event_type, cart_value, cart_abandonment, session_time_minutes, timestamp, conversion_flag' -Rows $crmEvents

# ERP Sales Orders
$erpOrders = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 240; $i++) {
  $oid = 'ORD_{0:D5}' -f $i
  $cid = 'CUST_{0:D4}' -f (($i % 260) + 1)
  $city = $cities[$i % $cities.Count]
  $od = '2025-04-{0:D2} {1:D2}:30:00' -f (($i % 28) + 1), (($i + 3) % 24)
  $sku = 'SKU_{0:D4}' -f (($i % 500) + 1)
  $qty = 1 + ($i % 8)
  $val = [math]::Round(500 + (($i * 71) % 4500), 2)
  $disc = [math]::Round(20 + (($i * 11) % 300), 2)
  $fth = 4 + ($i % 72)
  $st = $statuses[$i % $statuses.Count]
  $ret = if (($i % 9) -eq 0) { 'true' } else { 'false' }
  $ath = [math]::Round(8 + ($i % 24) + (($i % 100) / 100.0), 2)
  $esc = if (($i % 11) -eq 0) { 'true' } else { 'false' }
  $null = $erpOrders.Add("('$oid','$cid','$city','$od','$sku',$qty,$val,$disc,$fth,'$st',$ret,$ath,$esc)")
}
Add-InsertBlock -TableName 'erp_sales_orders' -Columns 'order_id, customer_id, city, order_date, sku_id, quantity, order_value, discount_amount, fulfillment_time_hours, order_status, return_flag, approval_time_hours, escalation_flag' -Rows $erpOrders

# Remaining tables (small rowsets, all-literal VALUES)
$erpInventory = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 40; $i++) {
  $null = $erpInventory.Add("('WH_$((($i % 5)+1))','SKU_$i',$((50 + ($i*3)%900)),$(([math]::Round((0.01 + ($i%10)/100.0),4).ToString('0.0000'))),$((($i%4))),$(([math]::Round((0.70 + ($i%20)/100.0),4).ToString('0.0000'))),'2025-05-$('{0:D2}' -f (($i%28)+1)) 08:00:00')")
}
Add-InsertBlock -TableName 'erp_inventory' -Columns 'warehouse_id, sku_id, inventory_level, spoilage_rate, stockout_events, forecast_accuracy, last_updated' -Rows $erpInventory

$erpProc = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 40; $i++) {
  $status = @('pending','in_review','approved')[$i % 3]
  $null = $erpProc.Add("('PO_$('{0:D6}' -f $i)','VEN_$((($i%50)+1))',$((10000 + $i*2500)),$(([math]::Round((0.05 + ($i%6)/100.0),4).ToString('0.0000'))),$(([math]::Round((20 + ($i%40)),2).ToString('0.00'))),$([string]::new('f','a','l','s','e')),'2025-04-$('{0:D2}' -f (($i%28)+1)) 10:00:00','$status',$([string]::new('f','a','l','s','e')))".Replace("$([string]::new('f','a','l','s','e'))","false"))
}
Add-InsertBlock -TableName 'erp_procurement' -Columns 'po_id, vendor_id, po_amount, inflation_rate, approval_time_hours, renegotiation_flag, created_date, approval_status, escalation_required' -Rows $erpProc

$hrEmployees = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 60; $i++) {
  $null = $hrEmployees.Add("('EMP_$('{0:D5}' -f $i)','$($roles[$i % $roles.Count])','$($departments[$i % $departments.Count])',$(([math]::Round((0.65 + ($i%30)/100.0),4).ToString('0.0000'))),$(([math]::Round((0.05 + ($i%20)/100.0),4).ToString('0.0000'))),'2023-01-$('{0:D2}' -f (($i%28)+1)) 09:00:00','EMP_$('{0:D5}' -f (($i%10)+1))',$((($i%5)+1)),'L$((($i%4)+1))')")
}
Add-InsertBlock -TableName 'hr_employees' -Columns 'employee_id, role, department, productivity_score, attrition_risk, hire_date, manager_id, decision_authority_level, salary_band' -Rows $hrEmployees

$hrReq = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 30; $i++) {
  $prio = @('high','medium','low')[$i % 3]
  $st = @('open','in_progress','filled')[$i % 3]
  $filled = if ($st -eq 'filled') { "'2025-05-$('{0:D2}' -f (($i%28)+1)) 17:00:00'" } else { 'NULL' }
  $null = $hrReq.Add("('REQ_$('{0:D5}' -f $i)','$($departments[$i % $departments.Count])',false,'$prio',$(([math]::Round((8 + ($i%48)),2).ToString('0.00'))),'$st','2025-05-$('{0:D2}' -f (($i%28)+1)) 11:00:00',$filled,false)")
}
Add-InsertBlock -TableName 'hr_job_requisitions' -Columns 'req_id, role_type, ai_related_flag, hiring_priority, approval_time_hours, status, created_date, filled_date, escalation_to_cfo' -Rows $hrReq

$workflow = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 40; $i++) {
  $wtype = @('order_fulfillment','vendor_approval','customer_onboarding','issue_resolution')[$i % 4]
  $st = @('completed','dropoff')[$i % 2]
  $completed = if ($st -eq 'completed') { "'2025-05-$('{0:D2}' -f (($i%28)+1)) 16:00:00'" } else { 'NULL' }
  $drop = if ($st -eq 'completed') { 0 } else { (($i % 3) + 1) }
  $null = $workflow.Add("('WF_$('{0:D6}' -f $i)','$wtype',false,$(([math]::Round((4 + ($i%72)),2).ToString('0.00'))),$([string]::new('t','r','u','e')),'2025-05-$('{0:D2}' -f (($i%28)+1)) 09:30:00',$completed,$drop,'$st')".Replace("$([string]::new('t','r','u','e'))","true"))
}
Add-InsertBlock -TableName 'workflow_events' -Columns 'workflow_id, workflow_type, escalation_flag, completion_time_hours, automation_flag, created_timestamp, completed_timestamp, stage_dropoff, status' -Rows $workflow

$financePnl = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt 12; $i++) {
  $month = '2025-{0:D2}-01' -f ($i + 1)
  $null = $financePnl.Add("('$month',$((55000000 + $i*350000)),$(([math]::Round((0.26 + ($i%5)/100.0),4).ToString('0.0000'))),$((2100000 + $i*50000)),$((1100000 + $i*40000)),$((120000 + $i*8000)),$(([math]::Round((0.08 + ($i%6)/100.0),4).ToString('0.0000'))),$((5100000 + $i*120000)))")
}
Add-InsertBlock -TableName 'finance_pnl' -Columns 'month, revenue, gross_margin, logistics_cost, marketing_spend, refund_cost, net_margin, operating_expenses' -Rows $financePnl

$budget = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 30; $i++) {
  $it = @('Marketing Campaign','Technology Investment','Warehouse Expansion')[$i % 3]
  $role = @('CFO','CEO','VP Finance')[$i % 3]
  $null = $budget.Add("('APPR_$('{0:D5}' -f $i)','$it',$((100000 + $i*25000)),false,$(([math]::Round((4 + ($i%20)),2).ToString('0.00'))),'2025-05-$('{0:D2}' -f (($i%28)+1)) 10:00:00','2025-05-$('{0:D2}' -f (($i%28)+1)) 15:00:00','$role',$((($i%3))))")
}
Add-InsertBlock -TableName 'finance_budget_approvals' -Columns 'approval_id, initiative_type, approved_amount, ai_initiative_flag, approval_time_hours, requested_date, approved_date, approver_role, escalation_count' -Rows $budget

$commerceOrders = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 60; $i++) {
  $status = @('completed','dropoff_stage_1','dropoff_stage_2','dropoff_stage_3')[$i % 4]
  $fulfilled = if ($status -eq 'completed') { "'2025-05-$('{0:D2}' -f (($i%28)+1)) 20:00:00'" } else { 'NULL' }
  $s1 = 'true'
  $s2 = if ($status -in @('completed','dropoff_stage_3')) { 'true' } else { 'false' }
  $s3 = if ($status -eq 'completed') { 'true' } else { 'false' }
  $null = $commerceOrders.Add("('COM_ORD_$('{0:D6}' -f $i)','CUST_$('{0:D4}' -f (($i%260)+1))',$((500 + ($i*45)%4500)),'$status','2025-05-$('{0:D2}' -f (($i%28)+1)) 11:00:00',$fulfilled,$s1,$s2,$s3,false)")
}
Add-InsertBlock -TableName 'commerce_orders' -Columns 'order_id, customer_id, order_total, fulfillment_status, created_timestamp, fulfilled_timestamp, stage_1_completion, stage_2_completion, stage_3_completion, data_inconsistency_flag' -Rows $commerceOrders

$returns = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 24; $i++) {
  $reason = @('damaged_product','wrong_item','late_delivery','changed_mind')[$i % 4]
  $null = $returns.Add("('RET_$('{0:D5}' -f $i)','COM_ORD_$('{0:D6}' -f (($i%60)+1))',$((200 + $i*35)),'$reason','2025-05-$('{0:D2}' -f (($i%28)+1)) 13:00:00',$(([math]::Round((2 + ($i%12)),2).ToString('0.00'))))")
}
Add-InsertBlock -TableName 'commerce_returns' -Columns 'return_id, order_id, refund_amount, reason_code, created_date, processing_time_hours' -Rows $returns

$deliveries = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 40; $i++) {
  $breach = if (($i % 8) -eq 0) { 'true' } else { 'false' }
  $delay = if ($breach -eq 'true') { 45 + ($i % 50) } else { 5 + ($i % 20) }
  $null = $deliveries.Add("('DEL_$('{0:D6}' -f $i)','COM_ORD_$('{0:D6}' -f (($i%60)+1))',$(([math]::Round((3 + ($i%24)),2).ToString('0.00'))),$breach,$((120 + $i*7)),$((3 + ($i%3))),'2025-05-$('{0:D2}' -f (($i%28)+1)) 18:30:00',$delay)")
}
Add-InsertBlock -TableName 'logistics_deliveries' -Columns 'delivery_id, order_id, delivery_time_hours, sla_breach, fuel_cost, customer_rating, delivery_date, delay_minutes' -Rows $deliveries

$tickets = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 40; $i++) {
  $sev = $severity[$i % $severity.Count]
  $resolved = if (($i % 7) -eq 0) { 'NULL' } else { "'2025-05-$('{0:D2}' -f (($i%28)+1)) 19:00:00'" }
  $null = $tickets.Add("('TKT_$('{0:D6}' -f $i)','$($issueTypes[$i % $issueTypes.Count])','$sev',$(([math]::Round((1 + ($i%30)),2).ToString('0.00'))),false,false,'2025-05-$('{0:D2}' -f (($i%28)+1)) 09:00:00',$resolved,'CUST_$('{0:D4}' -f (($i%260)+1))')")
}
Add-InsertBlock -TableName 'support_tickets' -Columns 'ticket_id, issue_type, severity, resolution_time_hours, escalation_flag, refund_requested, created_timestamp, resolved_timestamp, customer_id' -Rows $tickets

$security = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 20; $i++) {
  $etype = @('fraud_attempt','data_breach_attempt','unauthorized_access')[$i % 3]
  $null = $security.Add("('SEC_$('{0:D5}' -f $i)','$($severity[$i % $severity.Count])','$etype',$((($i%5)*5000)),false,'2025-05-$('{0:D2}' -f (($i%28)+1)) 07:00:00',$(([math]::Round((1 + ($i%10)),2).ToString('0.00'))))")
}
Add-InsertBlock -TableName 'security_events' -Columns 'event_id, severity, event_type, fraud_amount, customer_data_impact, timestamp, resolution_time_hours' -Rows $security

$campaigns = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 18; $i++) {
  $null = $campaigns.Add("('CAMP_$('{0:D4}' -f $i)',$((100000 + $i*20000)),$((500000 + $i*12000)),$((120 + $i*8)),$((600000 + $i*30000)),'2025-04-$('{0:D2}' -f (($i%28)+1)) 09:00:00','2025-05-$('{0:D2}' -f (($i%28)+1)) 18:00:00',$(([math]::Round((0.8 + ($i%6)/10.0),4).ToString('0.0000'))))")
}
Add-InsertBlock -TableName 'marketing_campaigns' -Columns 'campaign_id, spend, impressions, conversions, revenue_generated, start_date, end_date, roi' -Rows $campaigns

$vendors = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 30; $i++) {
  $rating = @('A','B','C')[$i % 3]
  $null = $vendors.Add("('VEN_$i',$(([math]::Round((0.05 + ($i%10)/100.0),4).ToString('0.0000'))),$(([math]::Round((0.75 + ($i%15)/100.0),4).ToString('0.0000'))),'$rating',$(([math]::Round((0.80 + ($i%10)/100.0),4).ToString('0.0000'))),$(([math]::Round((0.05 + ($i%6)/100.0),4).ToString('0.0000'))))")
}
Add-InsertBlock -TableName 'procurement_vendors' -Columns 'vendor_id, risk_score, compliance_score, sustainability_rating, on_time_delivery_rate, price_inflation_rate' -Rows $vendors

$sessions = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 80; $i++) {
  $null = $sessions.Add("('SESS_$('{0:D7}' -f $i)','CUST_$('{0:D4}' -f (($i%260)+1))',$((2 + ($i%30))),false,$(if(($i%4)-eq 0){'true'}else{'false'}),'2025-05-$('{0:D2}' -f (($i%28)+1)) 14:00:00',$((3 + ($i%12))),$(if(($i%3)-eq 0){'true'}else{'false'}))")
}
Add-InsertBlock -TableName 'product_analytics_sessions' -Columns 'session_id, customer_id, session_duration_minutes, crash_flag, checkout_completed, timestamp, pages_viewed, cart_abandonment' -Rows $sessions

$decisions = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 35; $i++) {
  $dtype = @('vendor_approval','budget_allocation','hiring_decision','pricing_change')[$i % 4]
  $owner = @('CFO','CEO','VP Operations','Director')[$i % 4]
  $urg = @('low','medium','high')[$i % 3]
  $null = $decisions.Add("('DEC_$('{0:D5}' -f $i)','$dtype','$owner','$urg',$(([math]::Round((4 + ($i%24)),2).ToString('0.00'))),$(if(($i%4)-eq 0){'true'}else{'false'}),$(([math]::Round((0.60 + ($i%20)/100.0),4).ToString('0.0000'))),'2025-05-$('{0:D2}' -f (($i%28)+1)) 10:45:00',$((5000 + $i*1250)),$((1 + ($i%5))))")
}
Add-InsertBlock -TableName 'decision_events' -Columns 'decision_id, decision_type, decision_owner_role, urgency_level, decision_latency_hours, escalation_required, outcome_quality_score, timestamp, value_usd, approval_chain_length' -Rows $decisions

$paths = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 50; $i++) {
  $role = @('Requester','Manager','Director','VP/CFO')[$i % 4]
  $null = $paths.Add("('DEC_$('{0:D5}' -f (($i%35)+1))',$((1 + ($i%4))),'$role',$(([math]::Round((1 + ($i%8)),2).ToString('0.00'))),$(if(($i%7)-eq 0){'true'}else{'false'}),'2025-05-$('{0:D2}' -f (($i%28)+1)) 12:00:00')")
}
Add-InsertBlock -TableName 'decision_paths' -Columns 'decision_id, step_number, role, delay_hours, rework_flag, timestamp' -Rows $paths

$friction = @(
  "('CFO','manual_prioritization',145,'high','No automated decision routing for <$50K approvals','2025-05-05 09:00:00')",
  "('VP Operations','decision_backlog',89,'high','Average queue before review starts','2025-05-06 09:00:00')",
  "('Director Product','unclear_process',56,'medium','Decision process expectations not documented','2025-05-07 09:00:00')",
  "('Manager Sales','system_lag',34,'medium','CRM to ERP sync delay','2025-05-08 09:00:00')",
  "('Manager HR','unclear_tasks',67,'high','Task descriptions unclear','2025-05-09 09:00:00')"
)
Add-InsertBlock -TableName 'role_friction_signals' -Columns 'role, friction_type, frequency, severity, root_cause, timestamp' -Rows $friction

$failures = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 24; $i++) {
  $stage = @('planning','approval','execution','handoff','completion')[$i % 5]
  $cause = @('fragmented_ownership','unclear_requirements','system_integration','resource_shortage')[$i % 4]
  $null = $failures.Add("('FAIL_$('{0:D4}' -f $i)','INIT_$((($i%20)+1))','$stage',$((5 + ($i%40))),$(([math]::Round((0.05 + ($i%30)/100.0),4).ToString('0.0000'))),'2025-05-$('{0:D2}' -f (($i%28)+1)) 08:30:00','$cause')")
}
Add-InsertBlock -TableName 'execution_failures' -Columns 'failure_id, initiative_id, failure_stage, delay_days, cost_overrun_pct, timestamp, root_cause_category' -Rows $failures

$signals = @(
  "('UB_RET_01','repeat_purchase_rate',0.72,0.68,'2025-05-01 09:00:00','revenue','high')",
  "('UB_RET_01','decision_latency',0.55,48,'2025-05-02 09:00:00','operational','medium')",
  "('UB_RET_01','sla_breach_rate',0.65,0.12,'2025-05-03 09:00:00','operational','high')",
  "('UB_RET_01','employee_productivity',0.81,0.78,'2025-05-04 09:00:00','people','medium')",
  "('UB_RET_01','capital_efficiency',0.73,2.4,'2025-05-05 09:00:00','financial','high')",
  "('UB_RET_01','cart_abandonment_rate',0.72,0.28,'2025-05-06 09:00:00','revenue','medium')"
)
Add-InsertBlock -TableName 'normalized_signals' -Columns 'company_id, signal_name, normalized_value, raw_value, timestamp, signal_category, impact_level' -Rows $signals

$dna = @(
  "('UB_RET_01','2025-05-10 09:00:00',78,62,71,66,74,70.2)",
  "('UB_RET_01','2025-05-03 09:00:00',76,64,69,65,72,69.2)",
  "('UB_RET_01','2025-04-26 09:00:00',74,66,68,64,71,68.6)",
  "('UB_RET_01','2025-04-19 09:00:00',75,65,70,66,73,69.8)",
  "('UB_RET_01','2025-04-12 09:00:00',77,63,71,65,74,70.0)"
)
Add-InsertBlock -TableName 'growth_dna_indices' -Columns 'company_id, timestamp, growth_velocity_index, execution_efficiency_index, capital_efficiency_index, resilience_index, innovation_index, overall_dna_score' -Rows $dna

$twin = @(
  "('UB_RET_01','2025-05-10 09:00:00',0.78,0.62,0.71,0.66,0.74,0.41,0.83,0.58,0.65,70.2)"
)
Add-InsertBlock -TableName 'digital_twin_state' -Columns 'company_id, timestamp, growth_velocity_index, execution_efficiency_index, capital_efficiency_index, resilience_index, innovation_index, active_pain_score, operational_load, decision_latency_index, transformation_readiness, overall_health_score' -Rows $twin

$sim = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -le 40; $i++) {
  $null = $sim.Add("('SIM_$('{0:D6}' -f $i)','BASE_SCENARIO',$i,$((1000+$i)),$(([math]::Round((0.05 + ($i%10)/100.0),4).ToString('0.0000'))),$((850000000 + $i*5500000)),$((85000000 + $i*300000)),$(([math]::Round((0.10 + ($i%15)/100.0),4).ToString('0.0000'))),$(if(($i%5)-eq 0){'false'}else{'true'}),'2025-05-$('{0:D2}' -f (($i%28)+1)) 06:00:00')")
}
Add-InsertBlock -TableName 'simulation_runs' -Columns 'run_id, scenario_id, iteration_number, random_seed, input_variance, output_revenue, output_profit, output_risk, success_flag, timestamp' -Rows $sim

$ioi = @(
  "('EVT_10001','2025-05-10 04:58:00','ERP','procurement','decision_delay','escalating_change','PO_001234','procurement_manager',22,'hours','high',true,true,false,false,'{""description"":""Escalating change for took 22 hours before decision was returned to normal""}')",
  "('EVT_10002','2025-05-10 03:09:00','CRM','customer','execution_dropoff','data_inconsistency','CUST_4521','sales_rep',6,'hours','medium',true,false,false,false,'{""description"":""Data inconsistency for took 6 hours before proceeding""}')",
  "('EVT_10003','2025-05-10 02:15:00','HRMS','staffing','escalation','role_approval_delay','REQ_00456','hr_manager',1,'escalation','critical',false,true,false,false,'{""description"":""Staffing issue escalated to CFO""}')",
  "('EVT_10004','2025-05-10 01:20:00','WORKFLOW','operations','execution_dropoff','ticket_unresolved','WF_008821','support_agent',4,'days','high',false,false,false,false,'{""description"":""Ticket unresolved for 4 days""}')",
  "('EVT_10005','2025-05-10 00:51:00','CRM','sales','opportunity','high_value_lead','CUST_9876','sales_exec',1200000,'INR','medium',true,true,false,false,'{""description"":""Opportunity worth 12 lakhs""}')"
)
Add-InsertBlock -TableName 'ioi_events_unified' -Columns 'event_id, timestamp, source_system, domain, event_type, event_subtype, entity_id, actor_type, raw_value, unit, severity, revenue_impact_flag, profit_impact_flag, valuation_impact_flag, reputation_impact_flag, metadata' -Rows $ioi

$null = $lines.Add('')
$null = $lines.Add('COMMIT;')

Set-Content -Path $outFile -Value $lines -Encoding UTF8
Write-Host "Created: $outFile"
Write-Host "Lines: $($lines.Count)"