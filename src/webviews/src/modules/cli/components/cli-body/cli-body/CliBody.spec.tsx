import React from 'react'
import { instance, mock } from 'ts-mockito'
import { screen, fireEvent } from '@testing-library/react'
import { Keys } from 'uiSrc/constants'
import * as useCliOutput from 'uiSrc/modules/cli/hooks/cli-output/useCliOutputStore'
import { render } from 'testSrc/helpers'
import { CliBody, Props } from './CliBody'

const mockedProps = mock<Props>()

const commandHistory = ['info', 'hello', 'keys *', 'clear']

const spy = vi.spyOn(useCliOutput, 'useCliOutputStore').mockImplementation(() => ({
  loading: false,
  commandHistory,
}))

vi.mock('uiSrc/slices/app/redis-commands', async () => {
  const defaultState = await vi.importActual<object>('uiSrc/slices/app/redis-commands')
  const { MOCK_COMMANDS_SPEC, MOCK_COMMANDS_ARRAY } = await vi.importActual<{ [key:string]:any }>('uiSrc/constants')
  return {
    ...(await vi.importActual<object>('uiSrc/slices/app/redis-commands')),
    appRedisCommandsSelector: vi.fn().mockReturnValue({
      ...defaultState,
      spec: MOCK_COMMANDS_SPEC,
      commandsArray: MOCK_COMMANDS_ARRAY,
    }),
  }
})

vi.mock('uiSrc/utils/cliHelper', async () => ({
  ...(await vi.importActual<object>('uiSrc/utils/cliHelper')),
  updateCliHistoryStorage: vi.fn(),
  clearOutput: vi.fn(),
}))

beforeEach(() => {
  spy.mockRestore()
})

describe('CliBody', () => {
  it('should render', () => {
    expect(render(<CliBody {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('Input should render without error', () => {
    render(<CliBody {...instance(mockedProps)} />)

    const cliInput = screen.queryByTestId('cli-command')

    expect(cliInput).toBeInTheDocument()
  })

  it('Input should not render with error', () => {
    render(<CliBody {...instance(mockedProps)} error="error" />)

    const cliInput = screen.queryByTestId('cli-command')

    expect(cliInput).toBeNull()
  })

  describe('CLI input special commands', () => {
    it('"clear" command should call "setOutputInitialState"', () => {
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()

      const command = 'clear'

      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'Enter',
      })

      expect(setCommandMock).toBeCalledWith('')
      expect(onSubmitMock).not.toBeCalled()
    })
  })

  describe('CLI input keyboard cases', () => {
    it('"Enter" keydown should call "onSubmit"', () => {
      const command = 'info'
      const onSubmitMock = vi.fn()

      render(<CliBody {...instance(mockedProps)} command={command} onSubmit={onSubmitMock} />)

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'Enter',
      })

      expect(onSubmitMock).toBeCalled()
    })

    it('"Ctrl+l" hot key for Windows OS should call "setOutputInitialState"', () => {
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'l',
        ctrlKey: true,
      })

      expect(onSubmitMock).not.toBeCalled()
    })

    it('"Command+k" hot key for MacOS should call "setOutputInitialState"', () => {
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'k',
        metaKey: true,
      })

      expect(onSubmitMock).not.toBeCalled()
    })

    it('"ArrowUp" should call "setCommand" with commands from history', () => {
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'ArrowUp',
      })

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'ArrowUp',
      })
      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: 'ArrowUp',
      })

      expect(onSubmitMock).not.toBeCalled()
    })

    it('"ArrowDown" should call "setCommand" with commands from history', () => {
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command="clear"
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      expect(onSubmitMock).not.toBeCalled()
    })

    it('"Tab" with command="" should setCommand first command from constants/commands ', () => {
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command=""
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: Keys.TAB,
      })

      expect(onSubmitMock).not.toBeCalled()
    })

    // eslint-disable-next-line max-len
    it('"Tab" with command="g" should setCommand first command starts with "g" from constants/commands ', () => {
      const command = 'g'
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: Keys.TAB,
      })

      expect(onSubmitMock).not.toBeCalled()
    })

    // eslint-disable-next-line max-len
    it('"Shift+Tab" with command="g" should setCommand last command starts with "g" from constants/commands ', () => {
      const command = 'g'
      const onSubmitMock = vi.fn()
      const setCommandMock = vi.fn()
      render(
        <CliBody
          {...instance(mockedProps)}
          command={command}
          setCommand={setCommandMock}
          onSubmit={onSubmitMock}
        />,
      )

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: Keys.TAB,
        shiftKey: true,
      })

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: Keys.TAB,
      })

      fireEvent.keyDown(screen.getByTestId('cli-command'), {
        key: Keys.TAB,
        shiftKey: true,
      })

      expect(onSubmitMock).not.toBeCalled()
    })
  })
})
