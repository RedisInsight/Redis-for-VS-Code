import React from 'react'
import { instance, mock } from 'ts-mockito'

import { fireEvent, render, screen, waitForStack } from 'testSrc/helpers'
import { RefreshBtn, Props } from './RefreshBtn'

const mockedProps = mock<Props>()

describe('RefreshBtn', () => {
  it('should render', async () => {
    expect(render(<RefreshBtn {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call onRefresh', async () => {
    const onRefresh = vi.fn()
    render(<RefreshBtn {...instance(mockedProps)} onClick={onRefresh} triggerTestid="refresh-key-btn" />)

    fireEvent.click(screen.getByTestId('refresh-key-btn'))
    await waitForStack()

    expect(onRefresh).toBeCalled()
  })
})
