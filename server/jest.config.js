/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/db/index.ts'
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
  testTimeout: 10000,
  // Run tests serially to avoid cleanup conflicts
  maxWorkers: 1,
  // Set environment variables before any tests run
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
};
