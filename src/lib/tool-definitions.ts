export const WORKFLOW_TOOLS = [
  {
    name: 'add_workflow_node',
    description: 'REQUIRED: Add a node to the workflow diagram. You MUST call this whenever the user mentions any data source, processing step, decision point, or output. Every conversation turn should add at least one node.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Unique snake_case identifier (e.g. "excel_upload", "ai_classify", "slack_notify")' },
        label: { type: 'string', description: 'Short display label, 2-4 words (e.g. "Excel Upload", "AI Classify")' },
        type: { type: 'string', enum: ['source', 'processor', 'decision', 'output', 'ai'], description: 'source=data input/file/API, processor=transformation/calculation, decision=branching/condition, output=report/notification/destination, ai=AI/ML processing step' },
        icon: { type: 'string', description: 'Single emoji representing this node (e.g. 📊, 🤖, 📧, 🔄)' },
        description: { type: 'string', description: 'One sentence describing what this node does in the workflow' },
      },
      required: ['id', 'label', 'type', 'icon', 'description'],
    },
  },
  {
    name: 'add_workflow_connection',
    description: 'Connect two nodes to show data flow. Call this after adding related nodes — every node should connect to at least one other node.',
    input_schema: {
      type: 'object' as const,
      properties: {
        from: { type: 'string', description: 'Source node id (data flows FROM this node)' },
        to: { type: 'string', description: 'Target node id (data flows TO this node)' },
        label: { type: 'string', description: 'Short label describing what flows between nodes (e.g. "raw CSV", "cleaned data", "if approved")' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'update_interview_stage',
    description: 'Advance the interview to the next stage. Call this when transitioning: outcome → data_sources → processing → outputs → review.',
    input_schema: {
      type: 'object' as const,
      properties: {
        stage: {
          type: 'string',
          enum: ['outcome', 'data_sources', 'processing', 'outputs', 'review'],
          description: 'The stage to transition to',
        },
        commentary: {
          type: 'string',
          description: 'Short commentary shown on the diagram (e.g. "Mapping data sources...", "Connecting the pipeline...")',
        },
      },
      required: ['stage', 'commentary'],
    },
  },
  {
    name: 'extract_user_context',
    description: 'Extract user profile information. Call this in the first 1-2 exchanges when you learn about the user.',
    input_schema: {
      type: 'object' as const,
      properties: {
        role: { type: 'string', description: 'Job title or role' },
        department: { type: 'string', description: 'Department or team' },
        company_context: { type: 'string', description: 'Brief company/industry context' },
        desired_outcomes: { type: 'array', items: { type: 'string' }, description: 'What they want to achieve' },
        pain_points: { type: 'array', items: { type: 'string' }, description: 'Current frustrations' },
        current_tools: { type: 'array', items: { type: 'string' }, description: 'Tools/systems in use' },
      },
    },
  },
]
