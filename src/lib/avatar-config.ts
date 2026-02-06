import type { AvatarPersonality } from './types'

export const AVATAR_PERSONALITIES: Record<string, AvatarPersonality> = {
  oracle: {
    key: 'oracle',
    name: 'Oracle',
    emoji: '\u{1F9E0}',
    photoUrl: '/avatars/oracle.jpg',
    trait: 'Strategic & analytical. Asks the hard questions. Has opinions.',
    tags: ['Industry patterns', 'Opinionated', 'Pushes back'],
    color: '#2d8014',
    glow: 'rgba(45,128,20,.15)',
    gradient: 'linear-gradient(135deg,#1a5c08,#2d8014)',
    senderColor: '#5cb83a',
    // ElevenLabs: "Adam" — deep, authoritative male voice
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    // Tavus: James — professional, authoritative male
    tavusReplicaId: 'r92debe21318',
    tavusPersonaId: undefined,
  },
  spark: {
    key: 'spark',
    name: 'Spark',
    emoji: '\u26A1',
    photoUrl: '/avatars/spark.jpg',
    trait: 'Creative & lateral. Sees connections nobody else does.',
    tags: ['What-if scenarios', 'Pattern finder', 'Lateral'],
    color: '#d97706',
    glow: 'rgba(245,158,11,.12)',
    gradient: 'linear-gradient(135deg,#92400e,#d97706)',
    senderColor: '#f59e0b',
    // ElevenLabs: "Josh" — energetic, youthful voice
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    // Tavus: Luna — creative, energetic female
    tavusReplicaId: 'r9d30b0e55ac',
    tavusPersonaId: undefined,
  },
  forge: {
    key: 'forge',
    name: 'Forge',
    emoji: '\u{1F528}',
    photoUrl: '/avatars/forge.jpg',
    trait: 'Direct & no-nonsense. Ships fast. Cuts the waste.',
    tags: ['No fluff', 'Fast decisions', 'Ship it'],
    color: '#6366f1',
    glow: 'rgba(99,102,241,.12)',
    gradient: 'linear-gradient(135deg,#312e81,#6366f1)',
    senderColor: '#818cf8',
    // ElevenLabs: "Arnold" — sharp, direct voice
    voiceId: 'VR6AewLTigWG4xSOukaG',
    // Tavus: Raj — direct, no-nonsense male
    tavusReplicaId: 'ra066ab28864',
    tavusPersonaId: undefined,
  },
  flow: {
    key: 'flow',
    name: 'Flow',
    emoji: '\u{1F30A}',
    photoUrl: '/avatars/flow.jpg',
    trait: 'Patient & thorough. Takes it step by step. Nothing missed.',
    tags: ['Step by step', 'Calm guidance', 'Thorough'],
    color: '#06b6d4',
    glow: 'rgba(6,182,212,.12)',
    gradient: 'linear-gradient(135deg,#164e63,#06b6d4)',
    senderColor: '#22d3ee',
    // ElevenLabs: "Rachel" — calm, warm female voice
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    // Tavus: Rose — calm, patient female
    tavusReplicaId: 'r1af76e94d00',
    tavusPersonaId: undefined,
  },
}

export const AVATAR_KEYS = Object.keys(AVATAR_PERSONALITIES) as Array<keyof typeof AVATAR_PERSONALITIES>
