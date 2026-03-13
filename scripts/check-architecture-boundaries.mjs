import { spawnSync } from 'node:child_process'

const rules = [
  {
    description: 'src/domain must not import infrastructure',
    pattern: "^import .*@/infrastructure/",
    path: 'src/domain'
  },
  {
    description: 'src/domain must not import vue',
    pattern: "^import .*from ['\\\"]vue['\\\"]",
    path: 'src/domain'
  },
  {
    description: 'src/application must not import infrastructure',
    pattern: "^import .*@/infrastructure/",
    path: 'src/application'
  },
  {
    description: 'src/application must not import vue',
    pattern: "^import .*from ['\\\"]vue['\\\"]",
    path: 'src/application'
  },
  {
    description: 'src/presentation must not import infrastructure repositories',
    pattern: "^import .*@/infrastructure/repositories/",
    path: 'src/presentation'
  },
  {
    description: 'src/presentation must not import infrastructure dto',
    pattern: '^import .*@/infrastructure/dto',
    path: 'src/presentation'
  },
  {
    description: 'src/views must not import infrastructure repositories',
    pattern: "^import .*@/infrastructure/repositories/",
    path: 'src/views'
  },
  {
    description: 'src/views must not import infrastructure dto',
    pattern: '^import .*@/infrastructure/dto',
    path: 'src/views'
  },
  {
    description: 'src/presentation must not import infrastructure logger',
    pattern: "^import .*@/infrastructure/logging/logger",
    path: 'src/presentation'
  },
  {
    description: 'src/views must not import infrastructure logger',
    pattern: "^import .*@/infrastructure/logging/logger",
    path: 'src/views'
  },
  {
    description: 'src/stores must not import infrastructure logger',
    pattern: "^import .*@/infrastructure/logging/logger",
    path: 'src/stores'
  },
  {
    description: 'src/presentation must not import infrastructure csrfService',
    pattern: "^import .*@/infrastructure/services/csrfService",
    path: 'src/presentation'
  },
  {
    description: 'src/views must not import infrastructure csrfService',
    pattern: "^import .*@/infrastructure/services/csrfService",
    path: 'src/views'
  },
  {
    description: 'src/stores must not import infrastructure csrfService',
    pattern: "^import .*@/infrastructure/services/csrfService",
    path: 'src/stores'
  }
]

console.log('[arch-boundaries] Checking forbidden imports...')

let violations = 0

for (const rule of rules) {
  const result = spawnSync('rg', ['-n', rule.pattern, rule.path], {
    encoding: 'utf-8'
  })

  if (result.error) {
    console.error(`[arch-boundaries] ERROR running rg for rule: ${rule.description}`)
    console.error(result.error.message)
    process.exit(1)
  }

  const matches = (result.stdout || '').trim()
  if (matches.length > 0) {
    console.error(`[arch-boundaries] FAIL: ${rule.description}`)
    console.error(matches)
    violations = 1
  } else {
    console.log(`[arch-boundaries] OK: ${rule.description}`)
  }
}

if (violations !== 0) {
  console.error('[arch-boundaries] Boundary violations detected.')
  process.exit(1)
}

console.log('[arch-boundaries] All checks passed.')
