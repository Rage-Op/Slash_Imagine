export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true
};
