import type { StoryObj } from '@storybook/react'
import { ScanMore } from './ScanMore'

type Story = StoryObj<typeof ScanMore>
// type Story = StoryObj<typeof ScanMore>
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: 'Components/ScanMore',
  component: ScanMore,
}

export const Default: Story = {
  args: {
    totalItemsCount: 100,
    nextCursor: '1',
    scanned: 1,
  },
}
export const Hidden: Story = {
  args: {
    totalItemsCount: 100,
    nextCursor: '0',
    scanned: 100,
  },
}
