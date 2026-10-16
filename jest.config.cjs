const { createDefaultPreset } = require('ts-jest');
module.exports = {
  ...createDefaultPreset({
    tsconfig: {
      module: 'CommonJS',
      moduleResolution: 'Node',
    },
  }),
  watchman: false,
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
