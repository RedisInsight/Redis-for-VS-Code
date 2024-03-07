'use strict'

module.exports = {
  color: true,
  delay: false,
  diff: true,
  package: './package.json',
  parallel: false,
  recursive: false,
  reporter: 'mochawesome',
  reporterOptions: {
    reportFilename: '[status]_[datetime]-[name]-report',
    quiet: true,
  },
  retries: 0,
  timeout: 40_000,
  ui: 'bdd',
}
