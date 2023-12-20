import '@testing-library/jest-dom/vitest'
import 'jsdom-worker'

import { mswServer } from 'testSrc/server'

export const URL = 'URL'
window.URL.revokeObjectURL = () => {}
window.URL.createObjectURL = () => URL

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('react-virtualized-auto-sizer', async () => ({
  ...(await vi.importActual<typeof import('react-virtualized-auto-sizer')>('react-virtualized-auto-sizer')),
  default: ({ children }: { children: any }) => children({ height: 600, width: 600 }),
}))

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock)
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
