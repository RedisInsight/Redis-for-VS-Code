import React from 'react'
import { Provider } from 'react-redux'
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit'
import { StoryObj } from '@storybook/react'
import { HttpResponse, http } from 'msw'
import { rootReducers, store } from 'uiSrc/store'
import { getMWSUrl, constants } from 'testSrc/helpers'
import { KeysTree } from './KeysTree'
import { initialState as initialStateKeys } from '../../slices/browser/keys.slice'

type Story = StoryObj<typeof KeysTree>

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
const MockStore = ({ keysState, children }: any) => (
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

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {}
export const MockedStore: Story = {
  name: 'Mocked store',
  decorators: [
    (story) => <MockStore keysState={constants.TEST_KEYS}>{story()}</MockStore>,
  ],
}

export const Msw: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          getMWSUrl('databases/:databaseId/keys'),
          () => HttpResponse.json(constants.TEST_KEYS_RESPONSE),
        ),
      ],
    },
  },
}
