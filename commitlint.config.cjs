/**
 * Commitlint Configuration
 * Enforces Conventional Commits format
 * 
 * Valid commit examples:
 * - feat(auth): add phone verification
 * - fix(cart): resolve quantity update bug
 * - docs: update README
 * - chore(deps): upgrade dependencies
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, no code change
        'refactor', // Code change, no behavior change
        'perf',     // Performance improvement
        'test',     // Adding/updating tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD changes
        'chore',    // Maintenance tasks
        'revert',   // Revert previous commit
      ],
    ],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject should not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Max header length
    'header-max-length': [2, 'always', 100],
  },
};
