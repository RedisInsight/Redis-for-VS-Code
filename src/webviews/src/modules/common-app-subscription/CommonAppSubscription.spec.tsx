import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import { Mock } from 'vitest'

import { cleanup, render } from 'testSrc/helpers'
import { CommonAppSubscription } from './CommonAppSubscription'

let socket: typeof MockedSocket
beforeEach(() => {
  cleanup()
  socket = new MockedSocket();
  (socketIO as Mock).mockReturnValue(socket)
})

vi.mock('socket.io-client')

vi.mock('uiSrc/slices/instances/instances', async () => ({
  ...await (vi.importActual('uiSrc/slices/instances/instances')),
  connectedInstanceSelector: vi.fn().mockReturnValue({
    id: vi.fn().mockReturnValue(''),
    connectionType: 'STANDALONE',
    db: 0,
  }),
}))

describe('CommonAppSubscription', () => {
  it('should render', () => {
    expect(render(<CommonAppSubscription />)).toBeTruthy()
  })
})
