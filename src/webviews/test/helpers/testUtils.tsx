import React from 'react'
import { cloneDeep, first, map } from 'lodash'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { RenderResult, render as rtlRender, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { RootState } from 'uiSrc/store'
import { initialState as initialStateKeys } from 'uiSrc/modules/keys-tree/slice/keys.slice'
import { initialState as initialStateCliSettings } from 'uiSrc/modules/cli/slice/cli-settings'
import { initialState as initialStateCliOutput } from 'uiSrc/modules/cli/slice/cli-output'
import { initialState as initialStateAppInfo } from 'uiSrc/slices/app/info/info.slice'
import { initialState as initialStateAppContext } from 'uiSrc/slices/app/context/context.slice'
import { initialState as initialStateAppRedisCommands } from 'uiSrc/slices/app/commands/redis-commands.slice'
import { initialState as initialStateDatabases } from 'uiSrc/slices/connections/databases/databases.slice'
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
    redisCommands: cloneDeep(initialStateAppRedisCommands),
  },
  connections: {
    databases: cloneDeep(initialStateDatabases),
  },
  browser: {
    keys: cloneDeep(initialStateKeys),
  },
  cli: {
    settings: cloneDeep(initialStateCliSettings),
    output: cloneDeep(initialStateCliOutput),
  },
  user: {
    settings: cloneDeep(initialStateUserSettings),
  },
}

// mocked store
export const mockStore = configureMockStore([thunk])
export const mockedStore = mockStore(initialStateDefault)

export {
  cleanup,
  screen,
  fireEvent,
  act,
} from '@testing-library/react'

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
