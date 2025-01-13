import React from 'react'
import { vi } from 'vitest'

import { TelemetryEvent } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import { vscodeApi } from 'uiSrc/services'
import { DEFAULT_DELIMITER, VscodeMessageAction } from 'uiSrc/constants'
import { fireEvent, render } from 'testSrc/helpers'
import { Settings } from './Settings'

const newDelimiter = '*1!'

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(vscodeApi, 'postMessage')

describe('Settings', () => {
  it('should render', () => {
    expect(render(<Settings />)).toBeTruthy()
  })

  it('should change delimiters', async () => {
    const { queryByTestId } = render(<Settings />)

    const multiSelectEl = document.querySelector('[id="select-multi-delimiters"]') as HTMLInputElement

    fireEvent.input(
      multiSelectEl,
      { target: { value: newDelimiter } },
    )

    fireEvent.keyDown(multiSelectEl, {
      key: 'Enter',
    })

    fireEvent.click(queryByTestId('apply-delimiter-btn')!)

    expect(vscodeApi.postMessage).toBeCalledWith({
      action: VscodeMessageAction.UpdateSettingsDelimiter, data: [':', newDelimiter],
    })
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: { from: [DEFAULT_DELIMITER], to: [DEFAULT_DELIMITER, newDelimiter] },
    })
  })
})
