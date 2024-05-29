import React from 'react'
import { instance, mock } from 'ts-mockito'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import * as utils from 'uiSrc/utils'
import { constants, fireEvent, render } from 'testSrc/helpers'

import { RejsonDetailsWrapper, Props } from './RejsonDetailsWrapper'
import { useRejsonStore } from './hooks/useRejsonStore'

const mockedProps = mock<Props>()

vi.spyOn(utils, 'sendEventTelemetry')
const EXPAND_OBJECT = 'expand-object'

const initialRejsonState = { data: { ...constants.REJSON_DATA_RESPONSE, type: 'object', data: [constants.REJSON_DATA] } }
beforeEach(() => {
  useRejsonStore.setState((state) => ({ ...state, ...initialRejsonState }))

  useSelectedKeyStore.useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
})

describe('RejsonDetailsWrapper', () => {
  it('should render', () => {
    expect(render(<RejsonDetailsWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should send telemetry on expand object', () => {
    const { getByTestId } = render(<RejsonDetailsWrapper {...instance(mockedProps)} />)

    fireEvent.click(getByTestId(EXPAND_OBJECT))

    expect(utils.sendEventTelemetry).toBeCalled()
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: utils.TelemetryEvent.TREE_VIEW_JSON_KEY_EXPANDED,
      eventData: { databaseId: undefined, level: 0 },
    })
  })
})
