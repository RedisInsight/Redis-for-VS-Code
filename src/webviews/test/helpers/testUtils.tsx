import React from 'react'
import { RenderResult, render as rtlRender, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'

import { ContextStoreProvider } from 'uiSrc/store'
import { BASE_RESOURCES_URL, BASE_URL } from 'uiSrc/constants'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'

interface Options {
  withRouter?: boolean
  [property: string]: any
}

export {
  cleanup,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react'

const scrollIntoViewMock = vi.fn()
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

// insert mocked store to the render Component
export const render = (
  ui: JSX.Element,
  { withRouter, ...renderOptions }: Options = {},
): RenderResult => {
  const Wrapper = ({ children }: { children: JSX.Element }) => (
    <KeysStoreProvider>
      <ContextStoreProvider>
        {children}
      </ContextStoreProvider>
    </KeysStoreProvider>
  )
  const MemoryWrapper = ({ children }: { children: JSX.Element }) => (
    <MemoryRouter>
      <Wrapper>
        {children}
      </Wrapper>
    </MemoryRouter>
  )

  const wrapper = !withRouter ? Wrapper : MemoryWrapper

  return rtlRender(ui, { wrapper, ...renderOptions })
}

export const waitForStack = async (timeout = 0) => {
  await waitFor(() => {}, { timeout })
}

export const getMWSUrl = (url: string) =>
  `${BASE_URL}${url.startsWith('/') ? url.slice(1) : url}`

export const getMWSResourceUrl = (url: string) =>
  `${BASE_RESOURCES_URL}${url.startsWith('/') ? url.slice(1) : url}`
