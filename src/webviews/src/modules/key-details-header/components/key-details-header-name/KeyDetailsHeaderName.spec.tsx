import React from 'react'
import { instance, mock } from 'ts-mockito'
import * as utils from 'uiSrc/utils'
import { TelemetryEvent } from 'uiSrc/utils'
import { fireEvent, render, screen, waitForStack } from 'testSrc/helpers'
import { Props, KeyDetailsHeaderName } from './KeyDetailsHeaderName'

const mockedProps = mock<Props>()
const originalClipboard = { ...global.navigator.clipboard }
const COPY_KEY_BTN = 'copy-name-button'

describe('KeyDetailsHeaderName', () => {
  beforeEach(() => {
    // @ts-ignore
    global.navigator.clipboard = {
      writeText: vi.fn(),
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
    // @ts-ignore
    global.navigator.clipboard = originalClipboard
  })

  it('should render', () => {
    expect(render(<KeyDetailsHeaderName {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should be able to copy key', async () => {
    vi.spyOn(utils, 'sendEventTelemetry')
    render(<KeyDetailsHeaderName {...mockedProps} />)

    fireEvent.click(screen.getByTestId(COPY_KEY_BTN))

    await waitForStack()

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TREE_VIEW_KEY_COPIED,
      eventData: { databaseId: undefined, keyType: 'string' },
    })
  })
})
