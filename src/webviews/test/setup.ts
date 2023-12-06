import '@testing-library/jest-dom/vitest'
import 'jsdom-worker'

import { mswServer } from 'testSrc/server'

export const URL = 'URL'
window.URL.revokeObjectURL = () => {}
window.URL.createObjectURL = () => URL

beforeAll(() => {
  mswServer.listen()
})

afterEach(() => {
  mswServer.resetHandlers()
})

afterAll(() => {
  // server.printHandlers()
  mswServer.close()
})
