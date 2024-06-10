import React from 'react'
import { Link } from 'react-router-dom'
import * as l10n from '@vscode/l10n'
import { getDbIndex, getUtmExternalLink } from 'uiSrc/utils'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from '../external/links'

export const InitOutputText = (
  host: string = '',
  port: number = 0,
  dbIndex: number = 0,
  emptyOutput: boolean,
) => [
  l10n.t('Connecting...'),
  '\n',
  l10n.t('Pinging Redis server on '),
  <span color="default" key={Math.random()}>
    {`${host}:${port}${getDbIndex(dbIndex)}`}
  </span>,
]

const unsupportedCommandTextCli = l10n.t({
  message:
    ' is not supported by the Redis CLI. The list of all unsupported commands: ',
  comment:
    'Example: INFO is not supported by the Redis CLI. The list of all unsupported commands: ...',
})
const unsupportedCommandTextWorkbench = l10n.t({
  message:
    ' is not supported by the Workbench. The list of all unsupported commands: ',
  comment:
    'Example: AUTH is not supported by the Workbench. The list of all unsupported commands: ...',
})
// eslint-disable-next-line react-refresh/only-export-components
export const cliTexts = {
  CLI_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextCli + commands,
  WORKBENCH_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextWorkbench + commands,
  REPEAT_COUNT_INVALID: l10n.t('Invalid repeat command option value'),
  CONNECTION_CLOSED: l10n.t(
    'Client connection previously closed. Run the command after the connection is re-created.',
  ),
  UNABLE_TO_DECRYPT: l10n.t(
    'Unable to decrypt. Check the system keychain or re-run the command.',
  ),
  SUBSCRIBE_COMMAND: () => (
    <span className="text-vscode-errorForeground" key={Date.now()}>
      {l10n.t({
        message: 'Use Pub/Sub available in the ',
        comment:
          'Context: Use Pub/Sub available in the Redis Insight application to see the messages published to all channels in your database.',
      })}
      <Link
        to={getUtmExternalLink(EXTERNAL_LINKS.riAppDownload, { campaign: UTM_CAMPAINGS.CLI })}
        color="text"
        target="_blank"
        data-test-subj="hello3-btn"
      >
        {l10n.t('Redis Insight application')}
      </Link>
      {l10n.t({
        message:
          ' to see the messages published to all channels in your database.',
        comment:
          'Context: Use "Pub/Sub" to see the messages published to all channels in your database.',
      })}
    </span>
  ),
  PSUBSCRIBE_COMMAND_CLI: () => [
    cliTexts.SUBSCRIBE_COMMAND(),
    '\n',
  ],
  SUBSCRIBE_COMMAND_CLI: () => [
    cliTexts.SUBSCRIBE_COMMAND(),
    '\n',
  ],
  SSUBSCRIBE_COMMAND_CLI: () => [
    cliTexts.SUBSCRIBE_COMMAND(),
    '\n',
  ],
  MONITOR_COMMAND: () => (
    <span className="text-vscode-errorForeground" key={Date.now()}>
      {l10n.t({
        message: 'Use Profiler tool available in the ',
        comment:
          'Context: Use Profiler tool available in the Redis Insight application to see all the requests processed by the server.',
      })}
      <Link
        to={getUtmExternalLink(EXTERNAL_LINKS.riAppDownload, { campaign: UTM_CAMPAINGS.CLI })}
        color="text"
        target="_blank"
        data-test-subj="monitor-btn"
      >
        {l10n.t('Redis Insight application')}
      </Link>
      {l10n.t({
        message: ' to see all the requests processed by the server.',
        comment:
          'Context: Use Profiler tool available in the Redis Insight application to see all the requests processed by the server.',
      })}
    </span>
  ),
  MONITOR_COMMAND_CLI: () => [
    cliTexts.MONITOR_COMMAND(),
    '\n',
  ],
  HELLO3_COMMAND: () => (
    <span className="text-vscode-errorForeground" key={Date.now()}>
      {l10n.t({
        message: 'Redis Insight does not support ',
        comment:
          'Context: Redis Insight does not support "RESP3" at the moment, but we are working on it.',
      })}
      <Link
        to="https://github.com/redis/redis-specifications/blob/master/protocol/RESP3.md"
        className="btnLikeLink"
        color="text"
        target="_blank"
        data-test-subj="hello3-btn"
      >
        RESP3
      </Link>
      {l10n.t({
        message: ' at the moment, but we are working on it.',
        comment:
          'Context: Redis Insight does not support "RESP3" at the moment, but we are working on it.',
      })}
    </span>
  ),
  HELLO3_COMMAND_CLI: () => [cliTexts.HELLO3_COMMAND(), '\n'],
  CLI_ERROR_MESSAGE: (message: string) => [
    '\n',
    <span className="text-vscode-errorForeground" key={Date.now()}>
      {message}
    </span>,
    '\n\n',
  ],
}
