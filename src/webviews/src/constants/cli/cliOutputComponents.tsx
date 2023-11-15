import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { getRouterLinkProps } from 'uiSrc/services'
import { getDbIndex } from 'uiSrc/utils'

export const InitOutputText = (
  host: string = '',
  port: number = 0,
  dbIndex: number = 0,
  emptyOutput: boolean,
  onClick: () => void,
) => [
  <Fragment key={Math.random()}>
    {emptyOutput && (
    <span className="color-green" key={Math.random()}>
      {'Try '}
      <Link
        onClick={onClick}
        className="color-green"
        style={{ fontSize: 'inherit', fontFamily: 'inherit' }}
        data-test-subj="cli-workbench-page-btn"
        to=""
      >
        Workbench
      </Link>
      , our advanced CLI. Check out our Quick Guides to learn more about Redis
      capabilities.
    </span>
    )}
  </Fragment>,
  '\n',
  'Connecting...',
  '\n',
  'Pinging Redis server on ',
  <span color="default" key={Math.random()}>
    {/* TODO: Remove mock after implementing DB connection: */}
    redis-12871.c309.us-east-2-1.ec2.cloud.redislabs.com:12871
    {`${host}:${port}${getDbIndex(dbIndex)}`}
  </span>,
]

const unsupportedCommandTextCli = ' is not supported by the RedisInsight CLI. The list of all unsupported commands: '
const unsupportedCommandTextWorkbench = ' is not supported by the Workbench. The list of all unsupported commands: '
// eslint-disable-next-line react-refresh/only-export-components
export const cliTexts = {
  CLI_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextCli + commands,
  WORKBENCH_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextWorkbench + commands,
  REPEAT_COUNT_INVALID: 'Invalid repeat command option value',
  CONNECTION_CLOSED:
    'Client connection previously closed. Run the command after the connection is re-created.',
  UNABLE_TO_DECRYPT:
    'Unable to decrypt. Check the system keychain or re-run the command.',
  PSUBSCRIBE_COMMAND: (path: string = '') => (
    <span color="danger" key={Date.now()}>
      {'Use '}
      <Link
        {...getRouterLinkProps(path)}
        color="text"
        data-test-subj="pubsub-page-btn"
        to=""
      >
        Pub/Sub
      </Link>
      {' to see the messages published to all channels in your database.'}
    </span>
  ),
  SUBSCRIBE_COMMAND: (path: string = '') => (
    <span color="danger" key={Date.now()}>
      {'Use '}
      <Link
        {...getRouterLinkProps(path)}
        color="text"
        data-test-subj="pubsub-page-btn"
        to=""
      >
        Pub/Sub
      </Link>
      {' tool to subscribe to channels.'}
    </span>
  ),
  PSUBSCRIBE_COMMAND_CLI: (path: string = '') => [
    cliTexts.PSUBSCRIBE_COMMAND(path),
    '\n',
  ],
  SUBSCRIBE_COMMAND_CLI: (path: string = '') => [
    cliTexts.SUBSCRIBE_COMMAND(path),
    '\n',
  ],
  MONITOR_COMMAND: (onClick: () => void) => (
    <span color="danger" key={Date.now()}>
      {'Use '}
      <Link
        onClick={onClick}
        className="btnLikeLink"
        color="text"
        data-test-subj="monitor-btn"
        to=""
      >
        Profiler
      </Link>
      {' tool to see all the requests processed by the server.'}
    </span>
  ),
  MONITOR_COMMAND_CLI: (onClick: () => void) => [
    cliTexts.MONITOR_COMMAND(onClick),
    '\n',
  ],
  HELLO3_COMMAND: () => (
    <span color="danger" key={Date.now()}>
      {'RedisInsight does not support '}
      <Link
        to="https://github.com/redis/redis-specifications/blob/master/protocol/RESP3.md"
        className="btnLikeLink"
        color="text"
        target="_blank"
        data-test-subj="hello3-btn"
      >
        RESP3
      </Link>
      {' at the moment, but we are working on it.'}
    </span>
  ),
  HELLO3_COMMAND_CLI: () => [cliTexts.HELLO3_COMMAND(), '\n'],
  CLI_ERROR_MESSAGE: (message: string) => [
    '\n',
    <span color="danger" key={Date.now()}>
      {message}
    </span>,
    '\n\n',
  ],
}
