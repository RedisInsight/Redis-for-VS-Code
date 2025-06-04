import React from 'react'

// import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
// import { RedisDefaultModules } from 'uiSrc/constants'
import {
  // waitFor,
  // fireEvent,
  render,
  screen,
} from 'testSrc/helpers'
import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
import { AddKey } from './AddKey'

vi.mock('uiSrc/slices/instances/instances', async () => ({
  ...(await vi.importActual<object>('uiSrc/slices/instances/instances')),
  connectedInstanceSelector: vi.fn().mockReturnValue({
    id: '1',
    modules: [],
  }),
}))

describe('AddKey', () => {
  it('should render', () => {
    expect(render(<AddKey />, { withRouter: true })).toBeTruthy()
  })

  it('should have key type select with predefined first value from options', () => {
    render(<AddKey />, { withRouter: true })

    expect((screen.getByTestId('select-key-type') as HTMLInputElement).value).toBe(ADD_KEY_TYPE_OPTIONS[0].value)
  })
})
