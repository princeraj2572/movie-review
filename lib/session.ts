export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let sessionId = localStorage.getItem('cinescope_session_id')
  if (!sessionId) {
    sessionId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem('cinescope_session_id', sessionId)
  }
  return sessionId
}
