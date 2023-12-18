/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './jest/globalSetup.ts',
  globalTeardown: './jest/globalTeardown.ts',
};