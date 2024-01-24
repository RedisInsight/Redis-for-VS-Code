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
    expect(render(<AddKey />)).toBeTruthy()
  })

  it('should have key type select with predefined first value from options', () => {
    render(<AddKey />)

    expect((screen.getByTestId('select-key-type') as HTMLInputElement).value).toBe(ADD_KEY_TYPE_OPTIONS[0].value)
  })

  // it('should show text if db not contains ReJSON module', async () => {
  //   render(<AddKey
  //   />)

  //   fireEvent.click(screen.getByTestId('select-key-type'))
  //   await waitFor(() => {
  //     fireEvent.click(
  //       screen.queryByText('JSON') || document,
  //     )
  //   })

  //   expect(screen.getByTestId('json-not-loaded-text')).toBeInTheDocument()
  // })

  // it('should not show text if db contains ReJSON module', async () => {
  //   (connectedInstanceSelector as vi.Mock).mockImplementation(() => ({
  //     modules: [{ name: RedisDefaultModules.FT }, { name: RedisDefaultModules.ReJSON }],
  //   }))

  //   render(<AddKey
  //   />)

  //   fireEvent.click(screen.getByTestId('select-key-type'))
  //   await waitFor(() => {
  //     fireEvent.click(
  //       screen.queryByText('JSON') || document,
  //     )
  //   })

  //   expect(screen.queryByTestId('json-not-loaded-text')).not.toBeInTheDocument()
  // })
})
