'use strict'

module.exports = {
  color: true,
  delay: false,
  diff: true,
  package: './package.json',
  parallel: false,
  recursive: false,
  reporter: 'mocha-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mochawesome, mocha-junit-reporter',
    mochawesomeReporterOptions: {
      reportFilename: 'index',
      quiet: true,
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: './mochawesome-report/junit-report.xml',
      toConsole: false,
    },
  },
  retries: 3,
  timeout: 100_000,
  ui: 'bdd',
}
