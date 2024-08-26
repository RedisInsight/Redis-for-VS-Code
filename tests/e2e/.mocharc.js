'use strict'

module.exports = {
  color: true,
  delay: false,
  diff: true,
  file: ['./tests/setup.js'],
  package: './package.json',
  parallel: false,
  recursive: false,
  reporter: 'mocha-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mochawesome, mocha-junit-reporter',
    mochawesomeReporterOptions: {
      reportFilename: '[status]_[datetime]-[name]-report',
      quiet: true,
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: './mochawesome-report/junit-report.xml',
      toConsole: false,
    },
  },
  retries: 1,
  timeout: 100_000,
  ui: 'bdd',
}
