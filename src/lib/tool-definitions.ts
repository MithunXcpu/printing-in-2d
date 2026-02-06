export const WORKFLOW_TOOLS = [
  {
    name: 'add_workflow_node',
    description: 'Add a node to the workflow diagram being built. Call this when you identify a data source, processing step, decision point, or output in the user\'s workflow.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Unique node identifier (snake_case, e.g. pos_data, normalize_step)' },
        label: { type: 'string', description: 'Short display label (2-4 words)' },
        type: { type: 'string', enum: ['source', 'processor', 'decision', 'output', 'ai'], description: 'Node type: source=data input, processor=transformation, decision=branching logic, output=final deliverable, ai=AI/ML step' },
        icon: { type: 'string', description: 'Single emoji icon for the node' },
        description: { type: 'string', description: 'Brief description of what this node does (one sentence)' },
      },
      required: ['id', 'label', 'type'],
    },
  },
  {
    name: 'add_workflow_connection',
    description: 'Connect two existing nodes in the workflow. Call this after adding nodes to show how data flows between them.',
    input_schema: {
      type: 'object' as const,
      properties: {
        from: { type: 'string', description: 'Source node id' },
        to: { type: 'string', description: 'Target node id' },
        label: { type: 'string', description: 'Optional label for the connection edge' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'update_interview_stage',
    description: 'Move the interview to the next stage. Call this when you\'ve gathered enough info for the current stage and are transitioning.',
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
          description: 'Short commentary about what was just mapped (shown on the diagram overlay)',
        },
      },
      required: ['stage'],
    },
  },
  {
    name: 'extract_user_context',
    description: 'Extract and store structured user context from the conversation. Call this when you learn important details about the user.',
    input_schema: {
      type: 'object' as const,
      properties: {
        role: { type: 'string', description: 'User\'s job title or role' },
        department: { type: 'string', description: 'Department or team' },
        company_context: { type: 'string', description: 'Brief company/industry context' },
        desired_outcomes: { type: 'array', items: { type: 'string' }, description: 'What the user wants to achieve' },
        pain_points: { type: 'array', items: { type: 'string' }, description: 'Current frustrations or inefficiencies' },
        current_tools: { type: 'array', items: { type: 'string' }, description: 'Tools/systems currently in use' },
      },
    },
  },
]
