import React from 'react'
import { Provider } from 'react-redux'
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit'
import { rootReducers, store } from 'uiSrc/store'
import { KeysTree } from './KeysTree'
import { initialState as initialStateKeys } from './slice/keys.slice'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: 'Components/KeysTree',
  component: KeysTree,
  decorators: [
    (Story: any) =>
      (
        <Provider store={store}>
          <Story />
        </Provider>
      ),
  ],
}

// A super-simple mock of a redux store
const Mockstore = ({ keysState, children }: any) => (
  <Provider
    store={configureStore({
      reducer: {
        ...rootReducers,
        browser: combineReducers({
          keys: createSlice({
            name: 'keys',
            initialState:
            {
              ...initialStateKeys,
              data: {
                ...initialStateKeys.data,
                keys: keysState,
              },
            },
            reducers: {},
          }).reducer,
        }),
      },
    })}
  >
    {children}
  </Provider>
)

const mockKeysData = [{ name: { type: 'Buffer', data: [98, 97, 114, 58, 49] }, type: 'string' }, { name: { type: 'Buffer', data: [102, 111, 111, 58, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [117, 97, 111, 101, 117, 97, 111, 101, 117, 97, 111, 101, 117, 97, 111, 101, 117] } }, { name: { type: 'Buffer', data: [116, 101, 115, 116, 51] } }, { name: { type: 'Buffer', data: [116, 101, 115, 116, 49, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [102, 111, 111, 58, 51] }, type: 'string' }, { name: { type: 'Buffer', data: [116, 101, 115, 116, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [98, 97, 114, 58, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [116, 101, 117, 111, 101, 117] }, type: 'string' }, { name: { type: 'Buffer', data: [102, 111, 111, 58, 49] }, type: 'string' }]

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default = {}
export const Mockedstore = {
  name: 'Mocked store',
  decorators: [
    (story: any) => <Mockstore keysState={mockKeysData}>{story()}</Mockstore>,
  ],
}

export const Msw = {}
