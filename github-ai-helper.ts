/**
 * AI Assistant GitHub Helper for induengicons repository
 * 
 * This file contains configuration and helper functions for AI assistants
 * to automatically handle GitHub operations for this repository.
 */

export const GITHUB_CONFIG = {
  repository: {
    owner: 'manjeetkumar53',
    name: 'induengicons',
    fullName: 'manjeetkumar53/induengicons',
    url: 'https://github.com/manjeetkumar53/induengicons.git'
  },
  authentication: {
    githubCliAccount: 'manjeetsingh53',
    gitUserName: 'Manjeet Kumar',
    gitUserEmail: 'manjeetkumar53@gmail.com'
  },
  lastUpdated: '2025-09-25',
  status: 'working'
} as const

export const GIT_OPERATIONS = {
  /**
   * Commands to run before any git operation
   */
  preOperationCommands: [
    'gh auth switch --user manjeetsingh53',
    'git config user.name "Manjeet Kumar"',
    'git config user.email "manjeetkumar53@gmail.com"'
  ],
  
  /**
   * Common git operations with proper authentication
   */
  push: './github-setup.sh push origin main',
  pull: './github-setup.sh pull origin main',
  fetch: './github-setup.sh fetch origin',
  setup: './github-setup.sh',
  
  /**
   * NPM scripts for git operations
   */
  npmScripts: {
    setup: 'npm run git:setup',
    push: 'npm run git:push', 
    pull: 'npm run git:pull',
    fetch: 'npm run git:fetch'
  }
} as const

/**
 * Instructions for AI assistants when handling git operations
 */
export const AI_INSTRUCTIONS = `
When performing git operations for this repository (induengicons), always:

1. First run: gh auth switch --user manjeetsingh53
2. Set git config: 
   - git config user.name "Manjeet Kumar"
   - git config user.email "manjeetkumar53@gmail.com"
3. Then perform the git operation

Or use the provided scripts:
- ./github-setup.sh (for setup only)
- ./github-setup.sh push origin main (for push)
- npm run git:push (alternative)

Repository Details:
- Owner: manjeetkumar53
- Authenticated via: manjeetsingh53 GitHub CLI account
- Last successful operation: 2025-09-25 (commit 601ed55)

Troubleshooting:
- If 403 error: Check gh auth status and switch account
- If account not found: Run gh auth login
- Always verify with gh auth status before git operations
`

export default {
  GITHUB_CONFIG,
  GIT_OPERATIONS,
  AI_INSTRUCTIONS
}