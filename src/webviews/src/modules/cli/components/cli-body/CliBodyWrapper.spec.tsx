import React from 'react'
import { first } from 'lodash'
import { screen, fireEvent } from '@testing-library/react'

import { Mock } from 'vitest'
import { render } from 'testSrc/helpers'
import { CliBodyWrapper } from './CliBodyWrapper'
import { processUnsupportedCommand } from '../../hooks/cli-output/useCliOutputThunks'

vi.mock('uiSrc/services', async () => ({
  ...(await vi.importActual<object>('uiSrc/services')),
  sessionStorageService: {
    set: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('uiSrc/utils/cliHelper', async () => ({
  ...(await vi.importActual<object>('uiSrc/utils/cliHelper')),
  updateCliHistoryStorage: vi.fn(),
  clearOutput: vi.fn(),
  cliParseTextResponse: vi.fn(),
  cliParseTextResponseWithOffset: vi.fn(),
}))

const unsupportedCommands = ['sync', 'subscription']
const cliCommandTestId = 'cli-command'

describe('CliBodyWrapper', () => {
  // It's not possible to simulate events on contenteditable with testing-react-library,
  // or any testing library that uses js - dom, because of a limitation on js - dom itself.
  // https://github.com/testing-library/dom-testing-library/pull/235
  it.skip('"onSubmit" should check unsupported commands', () => {
    const processUnsupportedCommandMock = vi.fn();

    (processUnsupportedCommand as Mock).mockImplementation(() => processUnsupportedCommandMock)

    render(<CliBodyWrapper />)

    // Act
    fireEvent.change(screen.getByTestId(cliCommandTestId), {
      target: { value: first(unsupportedCommands) },
    })

    // Act
    fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
      key: 'Enter',
    })

    expect(processUnsupportedCommandMock).toBeCalled()
  })

  // it('"onSubmit" for Cluster connection should call "sendCliClusterCommandAction"', () => {
  //   (connectedDatabaseSelector as Mock).mockImplementation(() => ({
  //     id: '123',
  //     connectionType: 'CLUSTER',
  //     db: 0,
  //   }))

  //   const sendCliClusterActionMock = vi.fn();

  //   (sendCliClusterCommandAction as Mock).mockImplementation(() => sendCliClusterActionMock)

  //   render(<CliBodyWrapper />)

  //   // Act
  //   fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
  //     key: 'Enter',
  //   })

  //   expect(sendCliClusterActionMock).toBeCalled()
  // })
})
