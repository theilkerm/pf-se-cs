/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use the recommended preset for ESM
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // The preset handles the transform, but we still need the moduleNameMapper
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  verbose: true,
  // forceExit: true,
  clearMocks: true,
};