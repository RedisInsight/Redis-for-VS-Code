import React from 'react'
import { cloneDeep } from 'lodash'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { RenderResult, render as rtlRender } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { RootState } from 'uiSrc/store'
import { initialState as initialStateKeys } from 'uiSrc/modules/keys-tree/slice/keys.slice'
import { initialState as initialStateAppInfo } from 'uiSrc/slices/app/info/info.slice'
import { initialState as initialStateAppContext } from 'uiSrc/slices/app/context/context.slice'
import { initialState as initialStateInstances } from 'uiSrc/slices/connections/instances/instances.slice'
import { initialState as initialStateUserSettings } from 'uiSrc/slices/user/user-settings.slice'
import { BASE_URL } from 'uiSrc/constants'

interface Options {
  initialState?: RootState
  withRouter?: boolean
  [property: string]: any
}

// root state
export const initialStateDefault: RootState = {
  app: {
    info: cloneDeep(initialStateAppInfo),
    context: cloneDeep(initialStateAppContext),
  },
  connections: {
    instances: cloneDeep(initialStateInstances),
  },
  browser: {
    keys: cloneDeep(initialStateKeys),
  },

  user: {
    settings: cloneDeep(initialStateUserSettings),
  },
}

// mocked store
export const mockStore = configureMockStore([thunk])
export const mockedStore = mockStore(initialStateDefault)

export { cleanup } from '@testing-library/react'

// insert mocked store to the render Component
export const render = (
  ui: JSX.Element,
  { initialState, withRouter, ...renderOptions }: Options = initialStateDefault,
): RenderResult => {
  const Wrapper = ({ children }: { children: JSX.Element }) => (
    <Provider store={mockedStore}>{children}</Provider>
  )

  const wrapper = !withRouter ? Wrapper : BrowserRouter

  return rtlRender(ui, { wrapper, ...renderOptions })
}

export const getMWSUrl = (url: string) =>
  `${BASE_URL}${url.startsWith('/') ? url.slice(1) : url}`
