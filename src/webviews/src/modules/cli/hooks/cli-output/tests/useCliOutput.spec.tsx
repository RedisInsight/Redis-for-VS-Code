import React from 'react'
import { apiService } from 'uiSrc/services'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useCliOutputStore,
  initialCliOutputState as initialStateInit,
} from '../useCliOutputStore'
import { ClusterNodeRole, CommandExecutionStatus } from 'uiSrc/interfaces'
import {
  sendCliCommandAction,
  sendCliClusterCommandAction,
} from '../useCliOutputThunks'
import { ApiErrors, cliTexts } from 'uiSrc/constants'
import * as useCliSettings from '../../cli-settings/useCliSettingsStore'
import * as useCliSettingsThunks from '../../cli-settings/useCliSettingsThunks'

beforeEach(() => {
  useCliOutputStore.setState(initialStateInit)
  useCliSettings.useCliSettingsStore.setState((state) => ({ ...state, cliClientUuid: constants.KEY_INFO }))
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCliOutputStore', () => {
  it('sendCliCommand', () => {
    // Arrange
    const { sendCliCommand } = useCliOutputStore.getState()
    // Act
    sendCliCommand()
    // Assert
    expect(useCliOutputStore.getState().loading).toEqual(true)
  })

  it('sendCliCommandFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { sendCliCommandFinal } = useCliOutputStore.getState()
    // Act
    sendCliCommandFinal()
    // Assert
    expect(useCliOutputStore.getState().loading).toEqual(false)
  })
  it('sendCliCommandFailure', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { sendCliCommandFailure } = useCliOutputStore.getState()
    // Act
    sendCliCommandFailure(constants.KEY_1_VALUE)
    // Assert
    expect(useCliOutputStore.getState().error).toEqual(constants.KEY_1_VALUE)
    expect(useCliOutputStore.getState().loading).toEqual(false)
  })
  it('concatToOutput', () => {
    // Arrange
    const initialState = { ...initialStateInit, data: ['1','2'] } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { concatToOutput } = useCliOutputStore.getState()
    // Act
    concatToOutput(['3'])
    // Assert
    expect(useCliOutputStore.getState().data).toEqual(['1','2','3'])
  })
  it('setOutput', () => {
    // Arrange
    const initialState = { ...initialStateInit, data: ['1'] } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { setOutput } = useCliOutputStore.getState()
    // Act
    setOutput(['3', '2'])
    // Assert
    expect(useCliOutputStore.getState().data).toEqual(['3','2'])
  })
  it('updateCliCommandHistory', () => {
    // Arrange
    const initialState = { ...initialStateInit, commandHistory: ['1'] } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { updateCliCommandHistory } = useCliOutputStore.getState()
    // Act
    updateCliCommandHistory(['3', '2'])
    // Assert
    expect(useCliOutputStore.getState().commandHistory).toEqual(['3','2'])
  })
  it('setCliDbIndex', () => {
    // Arrange
    const initialState = { ...initialStateInit, db: 1 } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { setCliDbIndex } = useCliOutputStore.getState()
    // Act
    setCliDbIndex(3)
    // Assert
    expect(useCliOutputStore.getState().db).toEqual(3)
  })
  it('resetOutput', () => {
    // Arrange
    const initialState = { ...initialStateInit, data: ['1'] } // Custom initial state
    useCliOutputStore.setState((state) => ({ ...state, ...initialState }))

    const { resetOutput } = useCliOutputStore.getState()
    // Act
    resetOutput()
    // Assert
    expect(useCliOutputStore.getState().commandHistory).toEqual([])
  })
})

describe('thunks', () => {
  describe('Standalone Cli command', () => {
    it('call both sendCliStandaloneCommandAction and sendCliCommandSuccess when response status is successed', async () => {
      // Arrange
      const command = constants.COMMAND
      const data = {
        response: 'tatata',
        status: CommandExecutionStatus.Success,
      }
      const responsePayload = { data, status: 200 }

      apiService.post = vi.fn().mockResolvedValue(responsePayload)

      // Act
      sendCliCommandAction(command)
      await waitForStack()

      // Assert
      expect(useCliOutputStore.getState().data[0].toString()).toEqual(
        (<span
          className="cli-output-response-success" data-testid="cli-output-response-success">
          "tatata"
        </span>).toString(),
      )
      expect(useCliOutputStore.getState().data[0].toString()).toEqual(
        (<span
          className="cli-output-response-success" data-testid="cli-output-response-success">
          "tatata"
        </span>).toString(),
      )
    })

    it('call setCliDbIndex when response status is successed', async () => {
      // Arrange
      const dbIndex = 1
      const command = `SELECT ${dbIndex}`
      const data = {
        response: 'tatata',
        status: CommandExecutionStatus.Success,
      }
      const responsePayload = { data, status: 200 }

      apiService.post = vi.fn().mockResolvedValue(responsePayload)

      // Act
      sendCliCommandAction(command)

      await waitForStack()

      // Assert
      expect(useCliOutputStore.getState().db).toEqual(dbIndex)

    })

    it('call both sendCliStandaloneCommandAction and sendCliCommandSuccess when response status is fail', async () => {
      // Arrange
      const command = constants.COMMAND
      const data = {
        response: '(err) tatata',
        status: CommandExecutionStatus.Fail,
      }
      const responsePayload = { data, status: 200 }

      apiService.post = vi.fn().mockResolvedValue(responsePayload)

      // Act
      sendCliCommandAction(command)
      await waitForStack()

      // Assert
      expect(useCliOutputStore.getState().data[0].toString()).toEqual(
        (<span
          className="cli-output-response-fail" data-testid="cli-output-response-fail">
          "tatata"
        </span>).toString(),
      )
    })

    it('call both updateCliClientAction on ClientNotFound error', async () => {
      // Arrange
      const command = constants.COMMAND
      const errorMessage = cliTexts.CONNECTION_CLOSED
      const responsePayload = {
        response: {
          status: 404,
          data: { message: errorMessage, name: ApiErrors.ClientNotFound },
        },
      }
      vi.spyOn(useCliSettingsThunks, 'updateCliClientAction')

      apiService.post = vi.fn().mockRejectedValueOnce(responsePayload)

      // Act
      sendCliCommandAction(command)
      await waitForStack()

      // Assert
      expect(useCliSettingsThunks.updateCliClientAction).toBeCalled()
    })
  })

  describe('Single Node Cluster Cli command', () => {
    it.only('call both sendCliClusterCommandAction and sendCliCommandSuccess when response status is successed', async () => {
      // Arrange
      const command = constants.COMMAND
      const data: any[] = [
        {
          response: '(nil)',
          status: CommandExecutionStatus.Success,
          node: { host: '127.0.0.1', port: 7002, slot: 6918 },
        },
      ]
      const responsePayload = { data, status: 200 }

      apiService.post = vi.fn().mockResolvedValue(responsePayload)

      // Act
      sendCliClusterCommandAction(command)
      await waitForStack()

      console.log(useCliOutputStore.getState().data[0])

      // Assert
      expect(useCliOutputStore.getState().data[0]).toContain('(nil)')
    })

    it('call both sendCliClusterCommandAction and sendCliCommandSuccess when response status is fail', async () => {
      // Arrange
      const command = constants.COMMAND
      const data: any[] = [
        {
          response: null,
          status: CommandExecutionStatus.Success,
          node: { host: '127.0.0.1', port: 7002, slot: 6918 },
        },
      ]
      const responsePayload = { data, status: 200 }

      apiService.post = vi.fn().mockResolvedValue(responsePayload)

      // Act
      sendCliClusterCommandAction(command)
      await waitForStack()

      // Assert
      expect(useCliOutputStore.getState().data[0].toString()).toEqual(
        '-> Redirected to slot [6918] located at 127.0.0.1:7002'
      )
    })

    it('call both updateCliClientAction on ClientNotFound error', async () => {
      // Arrange
      const command = constants.COMMAND
      const errorMessage = cliTexts.CONNECTION_CLOSED
      const responsePayload = {
        response: {
          status: 404,
          data: { message: errorMessage, name: ApiErrors.ClientNotFound },
        },
      }
      apiService.post = vi.fn().mockRejectedValueOnce(responsePayload)

      // Act
      sendCliClusterCommandAction(command)
      await waitForStack()

      // Assert
      expect(useCliSettingsThunks.updateCliClientAction).toBeCalled()
    })
  })
})
