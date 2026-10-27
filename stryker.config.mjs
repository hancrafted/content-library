export default {
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  typescriptChecker: {
    prioritizePerformanceOverAccuracy: true,
  },
  coverageAnalysis: 'perTest',
  inPlace: true,
  mutate: ['src/**/*.pure.ts', 'skills/**/scripts/**/*.ts', '!**/*.test.ts', '!**/*.spec.ts', '!**/*.d.ts'],
  reporters: ['html', 'json', 'clear-text'],
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/mutation.json',
  },
  thresholds: {
    high: 80,
    low: 60,
    break: null,
  },
  ignorePatterns: ['.stryker-tmp', '.worktrees', '.claude/worktrees', '.next', 'out', '.scratch', 'reports', '.vitest'],
};
