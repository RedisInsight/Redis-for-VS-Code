import React from 'react'
import { cloneDeep, first, map } from 'lodash'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { RenderResult, render as rtlRender, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { ContextStoreProvider, RootState } from 'uiSrc/store'
import { initialState as initialStateCliSettings } from 'uiSrc/modules/cli/slice/cli-settings'
import { initialState as initialStateCliOutput } from 'uiSrc/modules/cli/slice/cli-output'
import { BASE_URL } from 'uiSrc/constants'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'

interface Options {
  initialState?: RootState
  withRouter?: boolean
  [property: string]: any
}

// root state
export const initialStateDefault: RootState = {
  cli: {
    settings: cloneDeep(initialStateCliSettings),
    output: cloneDeep(initialStateCliOutput),
  },
}

// mocked store
export const mockStore = configureMockStore([thunk])
export const mockedStore = mockStore(initialStateDefault)

export {
  cleanup,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react'

const scrollIntoViewMock = vi.fn()
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

// insert mocked store to the render Component
export const render = (
  ui: JSX.Element,
  { initialState, withRouter, ...renderOptions }: Options = initialStateDefault,
): RenderResult => {
  const Wrapper = ({ children }: { children: JSX.Element }) => (
    <KeysStoreProvider>
      <ContextStoreProvider>
        <Provider store={mockedStore}>{children}</Provider>
      </ContextStoreProvider>
    </KeysStoreProvider>
  )

  const wrapper = !withRouter ? Wrapper : BrowserRouter

  return rtlRender(ui, { wrapper, ...renderOptions })
}

export const clearStoreActions = (actions: any[]) => {
  const newActions = map(actions, (action) => {
    const newAction = { ...action }
    if (newAction?.payload) {
      const payload = {
        ...first<any>(newAction.payload),
        key: '',
      } || {}
      newAction.payload = [payload]
    }
    return newAction
  })
  return JSON.stringify(newActions)
}

export const waitForStack = async (timeout = 0) => {
  await waitFor(() => {}, { timeout })
}

export const getMWSUrl = (url: string) =>
  `${BASE_URL}${url.startsWith('/') ? url.slice(1) : url}`
