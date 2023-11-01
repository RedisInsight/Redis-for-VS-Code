import React from 'react'
import { Provider } from 'react-redux'
import type { StoryObj } from '@storybook/react'
import { HttpResponse, http } from 'msw'

import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit'
import { rootReducers, store } from 'uiSrc/store'
import { initialState as initialStateKeys } from 'uiSrc/modules/keys-tree/slice/keys.slice'
import { KeysTreePage } from '.'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: 'Pages/KeysTreePage',
  component: KeysTreePage,
  decorators: [
    (Story: any) =>
      (
        <Provider store={store}>
          <Story />
        </Provider>
      )
  ]
}

// const meta: Meta<typeof KeysTreePage> = {
//   title: 'Pages/KeysTreePage',
//   component: KeysTreePage,
// }

// export default meta
type Story = StoryObj<typeof KeysTreePage>

// A super-simple mock of a redux store
const Mockstore = ({ keysState: keysDataState, initState = initialStateKeys, children }: any) => (
  <Provider
    store={configureStore({
      reducer: {
        ...rootReducers,
        browser: combineReducers({
          keys: createSlice({
            name: 'keys',
            initialState:
            {
              ...initState,
              data: keysDataState,
            },
            reducers: {},
          }).reducer,
        })
      },
    })}
  >
    {children}
  </Provider>
)

const mockKeysData = [{ keys: [{ name: { type: 'Buffer', data: [98, 97, 114, 58, 49] }, type: 'string' }, { name: { type: 'Buffer', data: [102, 111, 111, 58, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [117, 97, 111, 101, 117, 97, 111, 101, 117, 97, 111, 101, 117, 97, 111, 101, 117] } }, { name: { type: 'Buffer', data: [116, 101, 115, 116, 51] } }, { name: { type: 'Buffer', data: [116, 101, 115, 116, 49, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [102, 111, 111, 58, 51] }, type: 'string' }, { name: { type: 'Buffer', data: [116, 101, 115, 116, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [98, 97, 114, 58, 50] }, type: 'string' }, { name: { type: 'Buffer', data: [116, 101, 117, 111, 101, 117] }, type: 'string' }, { name: { type: 'Buffer', data: [102, 111, 111, 58, 49] }, type: 'string' }], total: 300, scanned: 3000, cursor: 0 }]

const noKeysData = [{ total: 0, scanned: 500, keys: [], cursor: 0 }]
// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {}

export const Mocked: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'http://localhost:5001/api/databases/:instanceId/keys',
          async () => HttpResponse.json(mockKeysData),
        ),
      ],
    },
  },
}

export const NoKeys: Story = {
  name: 'No keys',
  parameters: {
    msw: {
      handlers: [
        http.post(
          'http://localhost:5001/api/databases/:instanceId/keys',
          async () => HttpResponse.json(noKeysData),
        ),
      ],
    },
  },
}

export const Store: Story = {
  decorators: [
    (story) => <Mockstore keysState={mockKeysData}>{story()}</Mockstore>,
  ],
}

export const ScanMore: Story = {
  decorators: [
    (story) => <Mockstore keysState={{ ...mockKeysData, nextCursor: '1', total: null }}>{story()}</Mockstore>,
  ],
}
