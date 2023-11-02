import React from 'react'
import { Provider } from 'react-redux'
import type { StoryObj } from '@storybook/react'
import { HttpResponse, http } from 'msw'

import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit'
import { rootReducers, store } from 'uiSrc/store'
import { initialState as initialStateKeys } from 'uiSrc/modules/keys-tree/slice/keys.slice'
import { constants, getMWSUrl } from 'testSrc/helpers'
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
      ),
  ],
}

type Story = StoryObj<typeof KeysTreePage>

// A super-simple mock of a redux store
const MockStore = ({ keysState: keysStateData, children }: any) => (
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
                ...keysStateData,
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

const noKeysData = [{ total: 0, scanned: 500, keys: [], nextCursor: 0 }]
const mockPostKeys = [{ keys: [...constants.TEST_KEYS], total: 300, scanned: 3000, cursor: 0 }]
const mockKeys = { keys: [...constants.TEST_KEYS], total: 300, scanned: 3000, nextCursor: '0' }
const mockScanMore = { keys: [...constants.TEST_KEYS], total: 3000, scanned: 12, nextCursor: '200' }

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {}

export const Msw: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          getMWSUrl('databases/:instanceId/keys'),
          () => HttpResponse.json(mockPostKeys),
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
          getMWSUrl('databases/:instanceId/keys'),
          () => HttpResponse.json(noKeysData),
        ),
      ],
    },
  },
}

export const Store: Story = {
  decorators: [
    (story) => <MockStore keysState={mockKeys}>{story()}</MockStore>,
  ],
}

export const ScanMore: Story = {
  decorators: [
    (story) => <MockStore keysState={mockScanMore}>{story()}</MockStore>,
  ],
}
