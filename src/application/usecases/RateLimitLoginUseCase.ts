export interface RateLimitState {
  attempts: { timestamp: number }[]
}

export interface RateLimitResult {
  nextState: RateLimitState
  allowed: boolean
  waitTimeSeconds?: number
}

export class RateLimitLoginUseCase {
  constructor(
    private readonly maxAttempts = 5,
    private readonly windowMs = 60000
  ) {}

  execute(state: RateLimitState, now: number): RateLimitResult {
    const attempts = state.attempts.filter((attempt) => now - attempt.timestamp < this.windowMs)

    if (attempts.length >= this.maxAttempts) {
      const oldestAttempt = attempts[0].timestamp
      const waitTimeSeconds = Math.ceil((this.windowMs - (now - oldestAttempt)) / 1000)
      return {
        nextState: { attempts },
        allowed: false,
        waitTimeSeconds
      }
    }

    return {
      nextState: { attempts: [...attempts, { timestamp: now }] },
      allowed: true
    }
  }
}
