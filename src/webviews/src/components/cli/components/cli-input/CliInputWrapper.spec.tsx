import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { screen } from '@testing-library/react'
import { cleanup, mockedStore, render } from 'testSrc/helpers'
import CliInputWrapper, { Props } from './CliInputWrapper'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

vi.mock('uiSrc/slices/app/redis-commands', async () => {
  const defaultState = await vi.importActual<object>('uiSrc/slices/app/redis-commands')
  const { MOCK_COMMANDS_SPEC, MOCK_COMMANDS_ARRAY } = await vi.importActual<{ [key:string]:any }>('uiSrc/constants')
  return {
    ...vi.importActual<object>('uiSrc/slices/app/redis-commands'),
    appRedisCommandsSelector: vi.fn().mockReturnValue({
      ...defaultState,
      spec: MOCK_COMMANDS_SPEC,
      commandsArray: MOCK_COMMANDS_ARRAY,
    }),
  }
})

describe('CliInputWrapper', () => {
  it('should render', () => {
    expect(render(<CliInputWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('"get" command (with args) should render CliAutocomplete', () => {
    const setCommandMock = vi.fn()

    const command = 'get'

    render(
      <CliInputWrapper {...instance(mockedProps)} command={command} setCommand={setCommandMock} />,
    )

    expect(screen.getByTestId('cli-command')).toBeInTheDocument()
  })

  it('"client info" command (without args) should not render CliAutocomplete', () => {
    const setCommandMock = vi.fn()

    const command = 'client info'

    const { queryByTestId } = render(
      <CliInputWrapper {...instance(mockedProps)} command={command} setCommand={setCommandMock} />,
    )

    expect(queryByTestId('cli-command-autocomplete')).not.toBeInTheDocument()
  })
})
