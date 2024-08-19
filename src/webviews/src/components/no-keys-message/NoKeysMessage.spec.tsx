import React from 'react'
import { instance, mock } from 'ts-mockito'

import { vscodeApi } from 'uiSrc/services'
import { VscodeMessageAction } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { TelemetryEvent } from 'uiSrc/utils'
import { constants, fireEvent, render, waitForStack } from 'testSrc/helpers'
import { Props, NoKeysMessage } from './NoKeysMessage'

vi.spyOn(vscodeApi, 'postMessage')
vi.spyOn(utils, 'sendEventTelemetry')

const mockedProps = mock<Props>()

describe('NoKeysMessage', () => {
  it('should render', () => {
    expect(render(<NoKeysMessage {...mockedProps} />)).toBeTruthy()
  })

  describe('SearchMode = Pattern', () => {
    it('NoKeysFound should be rendered if total=0', async () => {
      const { container, queryByTestId } = render(<NoKeysMessage {...instance(mockedProps)} database={constants.DATABASE} total={0} />)
      expect(container).toHaveTextContent('Keys are the foundation of Redis.')
      const btnEl = queryByTestId('add-key-from-tree')

      fireEvent.click(btnEl!)
      await waitForStack()

      expect(btnEl).toBeInTheDocument()
      expect(vscodeApi.postMessage).toBeCalledWith({ action: VscodeMessageAction.AddKey, data: { database: constants.DATABASE } })
      expect(utils.sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
        eventData: { databaseId: constants.DATABASE.id },
      })
    })
    it('NoKeysFound should be rendered if total!=0', () => {
      const { container, queryByTestId } = render(<NoKeysMessage {...instance(mockedProps)} total={1} />)
      expect(container).toHaveTextContent('No results found.')
      expect(queryByTestId('add-key-from-tree')).not.toBeInTheDocument()
    })
  })
})
