module.exports = {
  'fail-zero': true,
  parallel: true,
  spec: ['tests/**/*.test.*'],
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register'
  ],
  extension: [
    'ts',
    'tsx'
  ],
  bail: true,
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '20000'
};
