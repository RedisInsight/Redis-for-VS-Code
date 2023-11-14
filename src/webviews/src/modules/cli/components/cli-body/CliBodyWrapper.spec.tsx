import React from 'react'
import { cloneDeep, first } from 'lodash'
import { useSelector } from 'react-redux'
import { screen, fireEvent } from '@testing-library/react'

import { Mock } from 'vitest'
import {
  processUnsupportedCommand,
  // sendCliClusterCommandAction,
} from 'uiSrc/modules/cli/slice/cli-output'
import { cleanup, mockedStore, render } from 'testSrc/helpers'
// import { connectedInstanceSelector } from 'uiSrc/slices/connections/instances/instances.slice'

import CliBodyWrapper from './CliBodyWrapper'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

vi.mock('uiSrc/services', () => ({
  ...vi.importActual<object>('uiSrc/services'),
  sessionStorageService: {
    set: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('uiSrc/slices/instances/instances', () => ({
  ...vi.importActual<object>('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: vi.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
    db: 0,
  }),
}))

vi.mock('uiSrc/slices/cli/cli-output', async () => ({
  ...(await vi.importActual<object>('uiSrc/slices/cli/cli-output')),
  sendCliClusterCommandAction: vi.fn(),
  processUnsupportedCommand: vi.fn(),
  updateCliCommandHistory: vi.fn,
  concatToOutput: () => vi.fn(),
}))

vi.mock('uiSrc/utils/cliHelper', () => ({
  ...vi.importActual<object>('uiSrc/utils/cliHelper'),
  updateCliHistoryStorage: vi.fn(),
  clearOutput: vi.fn(),
  cliParseTextResponse: vi.fn(),
  cliParseTextResponseWithOffset: vi.fn(),
}))

const unsupportedCommands = ['sync', 'subscription']
const cliCommandTestId = 'cli-command'

vi.mock('react-redux', () => ({
  ...vi.importActual<object>('react-redux'),
  useSelector: vi.fn(),
}))

describe('CliBodyWrapper', () => {
  beforeEach(() => {
    const state: any = store.getState();

    (useSelector as Mock).mockImplementation((callback: (arg0: any) => any) => callback({
      ...state,
      cli: {
        ...state.cli,
        settings: { ...state.cli.settings, loading: false },
      },
    }))
  })

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
  //   (connectedInstanceSelector as Mock).mockImplementation(() => ({
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
