import type { StoryObj } from '@storybook/react'
import React from 'react'
import { ScanMore } from './ScanMore'

type Story = StoryObj<typeof ScanMore>
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: 'Components/ScanMore',
  component: ScanMore,
  decorators: [
    (Story: any) =>
      (
        <div style={{ width: '200px', position: 'relative' }}>
          <Story />
        </div>
      ),
  ],
}

export const Default: Story = {
  args: {
    disabled: false,
  },
}
