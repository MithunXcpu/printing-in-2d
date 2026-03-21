import { AVAILABLE_ICON_NAMES } from './node-icons'

const iconList = AVAILABLE_ICON_NAMES.join(', ')

export const WORKFLOW_TOOLS = [
  {
    name: 'add_workflow_node',
    description: 'REQUIRED: Add a node to the workflow diagram. You MUST call this whenever the user mentions any data source, processing step, decision point, or output. Every conversation turn should add at least one node.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Unique snake_case identifier (e.g. "excel_upload", "weather_api", "compare_data")' },
        label: { type: 'string', description: 'Short display label, 2-4 words (e.g. "Excel Upload", "Weather API", "Compare Data")' },
        type: {
          type: 'string',
          enum: ['source', 'processor', 'decision', 'output', 'ai', 'trigger', 'api', 'database', 'notification', 'transform', 'display', 'storage'],
          description: 'source=data input/file, processor=transformation/calculation, decision=branching/condition, output=report/export, ai=AI/ML processing, trigger=webhook/schedule/event, api=external API call, database=database read/write, notification=alert/email/SMS, transform=data mapping/conversion, display=dashboard/UI/visualization, storage=file/cloud storage',
        },
        icon: {
          type: 'string',
          description: `Lucide icon name that best represents this node. Pick the most specific match. Available: ${iconList}`,
        },
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
    name: 'update_workflow_node',
    description: 'Update an existing node on the diagram. Use this when the user wants to change a node label, icon, or description.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'The node id to update' },
        label: { type: 'string', description: 'New label (optional)' },
        icon: { type: 'string', description: 'New Lucide icon name (optional)' },
        description: { type: 'string', description: 'New description (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'remove_workflow_node',
    description: 'Remove a node from the diagram and all its connections. Use this when the user says to delete or remove a step.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'The node id to remove' },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_interview_stage',
    description: 'Advance the interview to the next stage. Call this when transitioning between phases of the current-state/future-state interview flow.',
    input_schema: {
      type: 'object' as const,
      properties: {
        stage: {
          type: 'string',
          enum: [
            'current_state_1', 'current_state_2', 'current_state_3', 'current_state_4', 'current_state_5',
            'generate_current', 'validate_current',
            'future_state_1', 'future_state_2', 'future_state_3', 'future_state_4', 'future_state_5',
            'generate_future', 'validate_future',
            'compare', 'refine', 'orchestrate',
          ],
          description: 'The stage to transition to',
        },
        commentary: {
          type: 'string',
          description: 'Short commentary shown on the diagram (e.g. "Understanding your current process...", "Designing the future state...")',
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
  {
    name: 'generate_state_image',
    description: 'Generate a professional workflow diagram image for the current or future state. Call this after asking all 5 questions in a phase.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['current', 'future'], description: 'Which state to generate' },
        summary: { type: 'string', description: 'One-sentence summary of this state' },
        steps: { type: 'array', items: { type: 'string' }, description: 'Ordered list of process steps' },
        tools: { type: 'array', items: { type: 'string' }, description: 'Apps/services/tools mentioned' },
        pain_points: { type: 'array', items: { type: 'string' }, description: 'Key pain points (current state) or requirements (future state)' },
      },
      required: ['type', 'summary', 'steps'],
    },
  },
  {
    name: 'request_validation',
    description: 'Ask the user to validate the generated state image. Call this right after generate_state_image.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['current', 'future'], description: 'Which state to validate' },
        message: { type: 'string', description: 'Message to show alongside the image (e.g. "Does this capture your current process?")' },
      },
      required: ['type', 'message'],
    },
  },
]
