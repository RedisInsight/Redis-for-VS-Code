import '@testing-library/jest-dom/vitest'
import 'jsdom-worker'
import React from 'react'

import { mswServer } from 'testSrc/server'

export const URL = 'URL'
window.URL.revokeObjectURL = () => {}
window.URL.createObjectURL = () => URL

// Mock the ResizeObserver
// eslint-disable-next-line react-refresh/only-export-components
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('react-virtualized-auto-sizer', async () => ({
  ...(await vi.importActual<typeof import('react-virtualized-auto-sizer')>(
    'react-virtualized-auto-sizer',
  )),
  default: ({ children }: { children: any }) =>
    children({ height: 600, width: 600 }),
}))

vi.mock('react-monaco-editor', () => ({
  default: ({ value, onChange, 'data-testid': dataTestId }: any) => (
    <textarea
      data-testid={dataTestId}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
  monaco: {
    languages: {
      getLanguages: vi.fn(),
      register: vi.fn(),
      registerCompletionItemProvider: vi.fn().mockReturnValue({
        dispose: vi.fn(),
      }),
      registerSignatureHelpProvider: vi.fn().mockReturnValue({
        dispose: vi.fn(),
      }),
      setLanguageConfiguration: vi.fn(),
      setTokensProvider: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
      json: {
        jsonDefaults: {
          setDiagnosticsOptions: vi.fn(),
        },
      },
    },
  },
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
