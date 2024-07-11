import React from 'react'
import { StoryObj } from '@storybook/react'
import { HttpResponse, http } from 'msw'
import { getMWSUrl, constants } from 'testSrc/helpers'
import { KeysTree } from './KeysTree'

type Story = StoryObj<typeof KeysTree>

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: 'Components/KeysTree',
  component: KeysTree,
  decorators: [
    (Story: any) =>
      (
        <Story />
      ),
  ],
}

const MockStore = ({ keysState, children }: any) => (
  children
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
