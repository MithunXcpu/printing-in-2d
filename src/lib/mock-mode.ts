export function isMockMode(): boolean {
  const key = process.env.ANTHROPIC_API_KEY
  return !key || key === 'your-api-key-here' || key.trim() === ''
}
