import { describe, it, expect } from 'vitest'
import React from 'react'

import { render } from 'testSrc/helpers'
import { InitOutputText, cliTexts } from './cliOutputComponents'

describe('InitOutputText', () => {
  it('should render correct output with valid inputs', () => {
    const host = '127.0.0.1'
    const port = 6379
    const dbIndex = 1
    const { container } = render(<>{InitOutputText(host, port, dbIndex, false)}</>)

    expect(container).toHaveTextContent('Connecting...')
    expect(container).toHaveTextContent('Pinging Redis server on ')
    expect(container).toHaveTextContent(`${host}:${port}`)
  })
})

describe('cliTexts', () => {
  it('CLI_UNSUPPORTED_COMMANDS should format correctly', () => {
    const commandLine = 'INFO'
    const commands = 'AUTH, CONFIG'
    const result = cliTexts.CLI_UNSUPPORTED_COMMANDS(commandLine, commands)

    expect(result).toBe(
      `${`${commandLine} is not supported by the Redis CLI. The list of all unsupported commands: ${commands}`}`,
    )
  })

  it('CLI_ERROR_MESSAGE should render with the correct message', () => {
    const message = 'An error occurred'
    const result = cliTexts.CLI_ERROR_MESSAGE(message)
    const { getByText } = render(<>{result}</>)
    expect(getByText(message)).toHaveClass('text-vscode-errorForeground')
  })
})
