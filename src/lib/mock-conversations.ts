import type { AvatarKey, WorkflowNodeType } from './types'

export interface MockToolCall {
  name: string
  input: Record<string, unknown>
}

export interface MockChatStep {
  ai: string
  options: string[]
  toolCalls: MockToolCall[]
  commentary?: string
  interviewStage?: string
}

export interface MockConversation {
  steps: MockChatStep[]
}

// The 9 workflow nodes shared across all avatar conversations
const NODES = [
  { id: 'pos_data',     label: 'POS Data',     icon: '📊', type: 'source' as WorkflowNodeType,    description: 'Point-of-sale transaction data' },
  { id: 'weather_api',  label: 'Weather API',   icon: '🌤️', type: 'source' as WorkflowNodeType,    description: 'Weather data from external API' },
  { id: 'inventory_db', label: 'Inventory DB',  icon: '📦', type: 'source' as WorkflowNodeType,    description: 'Warehouse inventory database' },
  { id: 'normalize',    label: 'Normalize',     icon: '⚡', type: 'ai' as WorkflowNodeType,        description: 'Normalize and clean incoming data' },
  { id: 'merge',        label: 'Merge',         icon: '🔄', type: 'processor' as WorkflowNodeType, description: 'Merge data from all sources' },
  { id: 'forecast',     label: 'Forecast',      icon: '⚖️', type: 'decision' as WorkflowNodeType,  description: 'Run demand forecast model' },
  { id: 'report',       label: 'Report',        icon: '📋', type: 'output' as WorkflowNodeType,    description: 'Generate PDF/weekly report' },
  { id: 'notify',       label: 'Notify',        icon: '✅', type: 'output' as WorkflowNodeType,    description: 'Send alerts and notifications' },
  { id: 'dashboard',    label: 'Dashboard',     icon: '📈', type: 'output' as WorkflowNodeType,    description: 'Live analytics dashboard' },
]

function nodeCall(idx: number): MockToolCall {
  const n = NODES[idx]
  return { name: 'add_workflow_node', input: { id: n.id, label: n.label, type: n.type, icon: n.icon, description: n.description } }
}

function connCall(fromIdx: number, toIdx: number): MockToolCall {
  return { name: 'add_workflow_connection', input: { from: NODES[fromIdx].id, to: NODES[toIdx].id } }
}

function stageCall(stage: string, commentary?: string): MockToolCall {
  return { name: 'update_interview_stage', input: { stage, ...(commentary ? { commentary } : {}) } }
}

// ════════════════════════════════════════
// ORACLE — Strategic & analytical
// ════════════════════════════════════════
const oracleSteps: MockChatStep[] = [
  {
    ai: "What outcome are you trying to hit? Don't tell me the process — tell me the result.",
    options: [
      "I need to forecast seasonal demand across all SKUs — weekly, automated, no manual pulls.",
      "I want to predict which products will sell out before they actually do.",
      "I need a single dashboard that merges sales, weather, and inventory data."
    ],
    toolCalls: [stageCall('current_state_1')],
  },
  {
    ai: "Good. That's a consolidation workflow — multiple data sources feeding one output. Where does your primary sales data live?",
    options: [
      "POS system — we use Square. Real-time transaction data.",
      "It's in a mix of spreadsheets and our ERP system.",
      "We pull from Shopify plus in-store POS. Two separate systems."
    ],
    toolCalls: [
      nodeCall(0),
      stageCall('current_state_2', 'Identifying workflow type — this is <strong>consolidation</strong>, not orchestration.'),
    ],
    commentary: "Identifying workflow type — this is <strong>consolidation</strong>, not orchestration.",
  },
  {
    ai: "Got it. And the supplementary data — weather, inventory levels? How are those accessed today?",
    options: [
      "Weather from a public API. Inventory is in our warehouse management system.",
      "Both are manual — someone checks weather.com and counts stock.",
      "Weather API is automated, but inventory is still a weekly spreadsheet."
    ],
    toolCalls: [
      nodeCall(1),
      nodeCall(2),
      stageCall('current_state_3', 'Mapping data sources — <strong>3 inputs</strong> identified so far.'),
    ],
    commentary: "Mapping data sources — <strong>3 inputs</strong> identified so far.",
  },
  {
    ai: "Three sources. Now — what happens to this data today? Walk me through the transformation.",
    options: [
      "We normalize POS data first, then merge everything and run a forecast model.",
      "Someone manually cross-references in Excel. Takes most of Tuesday.",
      "We have a basic script that merges two of three, but forecasting is manual."
    ],
    toolCalls: [
      nodeCall(3),
      nodeCall(4),
      nodeCall(5),
      connCall(0, 3),
      connCall(1, 4),
      connCall(2, 4),
      connCall(3, 5),
      connCall(4, 5),
      stageCall('current_state_4', 'Building the processing layer — <strong>normalize, merge, forecast</strong>.'),
    ],
    commentary: "Building the processing layer — <strong>normalize, merge, forecast</strong>.",
  },
  {
    ai: "Last piece. Where does the output go? What do stakeholders actually need to see?",
    options: [
      "Weekly PDF report, Slack notification for anomalies, and a live dashboard.",
      "Just a dashboard with drill-down by region and category.",
      "Email report to leadership plus an alert system for stockout risk."
    ],
    toolCalls: [
      nodeCall(6),
      nodeCall(7),
      nodeCall(8),
      connCall(5, 6),
      connCall(5, 7),
      connCall(5, 8),
      stageCall('current_state_5', 'Connecting outputs — <strong>report, notify, dashboard</strong>. Workflow complete.'),
    ],
    commentary: "Connecting outputs — <strong>report, notify, dashboard</strong>. Workflow complete.",
  },
]

// ════════════════════════════════════════
// SPARK — Creative & lateral
// ════════════════════════════════════════
const sparkSteps: MockChatStep[] = [
  {
    ai: "Okay tell me — what's the wildest version of what you want this system to do? Don't hold back.",
    options: [
      "Predict which products will trend before the market knows — using sales + weather + vibes.",
      "I want a single view that tells me exactly what to stock, where, and when.",
      "Basically I want to see the future of demand across all our locations."
    ],
    toolCalls: [stageCall('current_state_1')],
  },
  {
    ai: "I love it. Here's what I'm hearing — you don't just want data, you want *signals*. What's your richest data source?",
    options: [
      "POS system — transaction-level, real-time, goes back 3 years.",
      "Our CRM actually has the best customer behavior data.",
      "Honestly? Our staff's gut instincts are pretty good — but we can't scale that."
    ],
    toolCalls: [
      nodeCall(0),
      stageCall('current_state_2', 'Finding the signal source — the richest <strong>data stream</strong>.'),
    ],
    commentary: "Finding the signal source — the richest <strong>data stream</strong>.",
  },
  {
    ai: "What if we layered in something unexpected? Weather patterns shifted buying cycles last year for half of retail.",
    options: [
      "Yes! Weather API data — temperature and precipitation affect our top categories.",
      "Hmm, what about social media trends? Could we pull that in?",
      "We already track weather manually. Automating it would save hours."
    ],
    toolCalls: [
      nodeCall(1),
      nodeCall(2),
      stageCall('current_state_3', 'Layering inputs — <strong>unconventional data sources</strong> unlock better predictions.'),
    ],
    commentary: "Layering inputs — <strong>unconventional data sources</strong> unlock better predictions.",
  },
  {
    ai: "Now here's where it gets interesting. What if we didn't just merge — what if we *cross-pollinated* the data?",
    options: [
      "Normalize first, then merge by time window and location. Run a forecast model.",
      "Could we weight sources differently based on accuracy history?",
      "What if the system learned which combinations predict best for each product?"
    ],
    toolCalls: [
      nodeCall(3),
      nodeCall(4),
      nodeCall(5),
      connCall(0, 3),
      connCall(1, 4),
      connCall(2, 4),
      connCall(3, 5),
      connCall(4, 5),
      stageCall('current_state_4', 'Cross-pollination layer — <strong>smart merging beats dumb merging</strong>.'),
    ],
    commentary: "Cross-pollination layer — <strong>smart merging beats dumb merging</strong>.",
  },
  {
    ai: "The output shouldn't be a report people read. It should be a *trigger* that makes things happen. What fires?",
    options: [
      "Dashboard for the team, alerts for anomalies, and a PDF for leadership.",
      "Auto-reorder suggestions when forecast shows stockout risk.",
      "Slack alerts plus a live dashboard that updates every hour."
    ],
    toolCalls: [
      nodeCall(6),
      nodeCall(7),
      nodeCall(8),
      connCall(5, 6),
      connCall(5, 7),
      connCall(5, 8),
      stageCall('current_state_5', 'Output as <strong>triggers, not reports</strong>. The workflow is alive.'),
    ],
    commentary: "Output as <strong>triggers, not reports</strong>. The workflow is alive.",
  },
]

// ════════════════════════════════════════
// FORGE — Direct & no-nonsense
// ════════════════════════════════════════
const forgeSteps: MockChatStep[] = [
  {
    ai: "Outcome. One sentence. Go.",
    options: [
      "Automated weekly demand forecast. POS + weather + inventory. Dashboard output.",
      "Predict stockouts before they happen. Need it running by end of month.",
      "Replace our manual forecasting process with something that just runs."
    ],
    toolCalls: [stageCall('current_state_1')],
  },
  {
    ai: "Clear. Source one — where's the sales data?",
    options: [
      "Square POS. API access. Real-time transactions.",
      "Shopify. We can pull via their REST API.",
      "SAP export. CSV dump every morning."
    ],
    toolCalls: [
      nodeCall(0),
      stageCall('current_state_2', 'Source locked — <strong>POS data</strong>.'),
    ],
    commentary: "Source locked — <strong>POS data</strong>.",
  },
  {
    ai: "Source two and three. Weather and inventory. How?",
    options: [
      "OpenWeather API for weather. Warehouse DB for inventory. Both have APIs.",
      "Weather from NOAA. Inventory is a shared Google Sheet updated daily.",
      "Public weather API. Inventory lives in our ERP — NetSuite."
    ],
    toolCalls: [
      nodeCall(1),
      nodeCall(2),
      stageCall('current_state_3', 'All <strong>3 sources identified</strong>. Moving to processing.'),
    ],
    commentary: "All <strong>3 sources identified</strong>. Moving to processing.",
  },
  {
    ai: "Processing. I'm seeing: normalize POS → merge all three → run forecast. Correct?",
    options: [
      "Exactly. Normalize by date/SKU, merge on those keys, then forecast.",
      "Yes, but add a data quality check before the merge step.",
      "Close. We also need to handle timezone differences in the data."
    ],
    toolCalls: [
      nodeCall(3),
      nodeCall(4),
      nodeCall(5),
      connCall(0, 3),
      connCall(1, 4),
      connCall(2, 4),
      connCall(3, 5),
      connCall(4, 5),
      stageCall('current_state_4', '<strong>Three-stage processing</strong> pipeline mapped.'),
    ],
    commentary: "<strong>Three-stage processing</strong> pipeline mapped.",
  },
  {
    ai: "Output. What hits people's screens?",
    options: [
      "Weekly report, anomaly alerts, live dashboard. All three.",
      "Just the dashboard. Everything else is noise.",
      "Report to leadership. Dashboard for ops. Slack for urgent flags."
    ],
    toolCalls: [
      nodeCall(6),
      nodeCall(7),
      nodeCall(8),
      connCall(5, 6),
      connCall(5, 7),
      connCall(5, 8),
      stageCall('current_state_5', '<strong>Done.</strong> Full pipeline: 3 sources → 3 processors → 3 outputs.'),
    ],
    commentary: "<strong>Done.</strong> Full pipeline: 3 sources → 3 processors → 3 outputs.",
  },
]

// ════════════════════════════════════════
// FLOW — Patient & thorough
// ════════════════════════════════════════
const flowSteps: MockChatStep[] = [
  {
    ai: "Let's take this one step at a time. First — when you sit down on Monday morning, what's the first thing you open?",
    options: [
      "The POS dashboard. I check what sold over the weekend across all locations.",
      "Email. Usually there's a report from the warehouse about inventory levels.",
      "Honestly? A spreadsheet I've been maintaining for three years."
    ],
    toolCalls: [stageCall('current_state_1')],
  },
  {
    ai: "That's a great starting point. So the POS system is your first source of truth. What do you do with that data next?",
    options: [
      "I export it and clean it up — normalize dates, SKU formats, remove test transactions.",
      "I scroll through and note the big movers. It's pretty manual right now.",
      "I compare it against last year's numbers to spot trends."
    ],
    toolCalls: [
      nodeCall(0),
      stageCall('current_state_2', 'First source identified — <strong>POS data</strong>. Starting the map.'),
    ],
    commentary: "First source identified — <strong>POS data</strong>. Starting the map.",
  },
  {
    ai: "Makes sense. Now, you mentioned weather affecting demand. How does that data enter your workflow today?",
    options: [
      "I check a weather API — temperature and precipitation for each store region.",
      "Someone on the team tracks it manually and drops it in our shared sheet.",
      "We use a weather service but it's not connected to anything automated."
    ],
    toolCalls: [
      nodeCall(1),
      nodeCall(2),
      stageCall('current_state_3', 'Adding <strong>weather</strong> and <strong>inventory</strong> sources to the map.'),
    ],
    commentary: "Adding <strong>weather</strong> and <strong>inventory</strong> sources to the map.",
  },
  {
    ai: "Good. So you have POS, weather, and inventory as inputs. What happens when you bring them together?",
    options: [
      "I normalize everything first, then merge by date and location, then run my forecast model.",
      "I paste them into tabs in Excel and use formulas to cross-reference.",
      "We have a Python script that merges two of three. The third is still manual."
    ],
    toolCalls: [
      nodeCall(3),
      nodeCall(4),
      nodeCall(5),
      connCall(0, 3),
      connCall(1, 4),
      connCall(2, 4),
      connCall(3, 5),
      connCall(4, 5),
      stageCall('current_state_4', 'Building the middle layer — <strong>normalize → merge → forecast</strong>.'),
    ],
    commentary: "Building the middle layer — <strong>normalize → merge → forecast</strong>.",
  },
  {
    ai: "Last step. Once the forecast is ready — who sees it and how?",
    options: [
      "I generate a PDF report, send a summary to Slack, and update our dashboard.",
      "It goes into a Google Sheet that leadership checks on Fridays.",
      "Dashboard for the team, email digest for leadership, alerts for anomalies."
    ],
    toolCalls: [
      nodeCall(6),
      nodeCall(7),
      nodeCall(8),
      connCall(5, 6),
      connCall(5, 7),
      connCall(5, 8),
      stageCall('current_state_5', 'Outputs connected — <strong>report, notify, dashboard</strong>. Your workflow is mapped.'),
    ],
    commentary: "Outputs connected — <strong>report, notify, dashboard</strong>. Your workflow is mapped.",
  },
]

export const MOCK_CONVERSATIONS: Record<AvatarKey, MockConversation> = {
  oracle: { steps: oracleSteps },
  spark:  { steps: sparkSteps },
  forge:  { steps: forgeSteps },
  flow:   { steps: flowSteps },
}
