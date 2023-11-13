import React from 'react'
import { render } from '@testing-library/react'
import CLI from './Cli'

vi.mock('uiSrc/slices/app/commands/redis-commands.slice', async () => ({
  ...(await vi.importActual<object>('uiSrc/slices/app/commands/redis-commands.slice')),
  appRedisCommandsSelector: vi.fn().mockReturnValue({
    ...await vi.importActual<object>('uiSrc/slices/app/commands/redis-commands.slice'),
  }),
}))

describe('CLI', () => {
  it('should render', () => {
    expect(render(<CLI />)).toBeTruthy()
  })
})
