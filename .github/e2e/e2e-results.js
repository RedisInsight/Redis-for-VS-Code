const fs = require('fs');

let parallelNodeInfo = '';
const totalNodes = 4;
if (totalNodes > 1) {
  parallelNodeInfo = ` (node: ${parseInt(process.env.NODE_INDEX, 10) + 1}/${totalNodes})`
}

const file = fs.readdirSync('tests/e2e/mochawesome-report').find(file => file.endsWith('-setup-report.json'))
const appBuildType = process.env.APP_BUILD_TYPE || 'VSCode (Linux)'
const results = {
  message: {
    text: `*E2ETest - ${appBuildType}${parallelNodeInfo}* (Branch: *${process.env.GITHUB_REF_NAME}*)` +
      `\n<https://github.com/RedisInsight/RedisInsight/actions/runs/${process.env.GITHUB_RUN_ID}|View on Github Actions>`,
    attachments: [],
  },
};

const result = JSON.parse(fs.readFileSync(file, 'utf-8'))
const testRunResult = {
  color: '#36a64f',
  title: `Started at: *${result.stats.start}`,
  text: `Executed ${result.stats.tests} in ${(new Date(result.stats.end) - new Date(result.stats.start)) / 1000}s`,
  fields: [
    {
      title: 'Passed',
      value: result.stats.passes,
      short: true,
    },
    {
      title: 'Skipped',
      value: result.stats.skipped,
      short: true,
    },
  ],
};
const failed = result.stats.failures;
if (failed) {
  results.passed = false;
  testRunResult.color = '#cc0000';
  testRunResult.fields.push({
    title: 'Failed',
    value: failed,
    short: true,
  });
}

results.message.attachments.push(testRunResult);

if (results.passed === false) {
  results.message.text = '<!here> ' + results.message.text;
}

fs.writeFileSync('e2e.report.json', JSON.stringify({
  channel: process.env.SLACK_TEST_REPORT_CHANNEL,
  ...results.message,
}));
