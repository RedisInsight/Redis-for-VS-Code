import React from 'react'
import { Mock } from 'vitest'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import * as moduleUtils from 'uiSrc/modules/keys-tree/utils'
import { apiService } from 'uiSrc/services'
import {
  constants,
  fireEvent,
  render,
  screen,
  waitForStack,
} from 'testSrc/helpers'

import { KeyTreeFilter } from './KeyTreeFilter'
import { ALL_KEY_TYPES_VALUE } from './constants'
import * as useKeys from '../../hooks/useKeys'

const APPLY_BTN = 'key-tree-filter-apply-btn'
const CLEAR_BTN = 'key-tree-filter-clear-btn'
const TREE_FILTER_TRIGGER_BTN = 'key-tree-filter-trigger'
const FILTER_SELECT = 'tree-view-filter-select'
const SEARCH_INPUT = 'tree-view-search-input'

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(moduleUtils, 'parseKeysListResponse').mockImplementation(() => constants.KEYS_LIST)

describe('KeyTreeDelimiter', () => {
  it('should render', () => {
    expect(render(<KeyTreeFilter />)).toBeTruthy()
  })

  it('Filter trigger button should be rendered', () => {
    render(<KeyTreeFilter />)

    expect(screen.getByTestId(TREE_FILTER_TRIGGER_BTN)).toBeInTheDocument()
  })

  it('Search input and Filter selector should be rendered after click on button', () => {
    render(<KeyTreeFilter />)

    fireEvent.click(screen.getByTestId(TREE_FILTER_TRIGGER_BTN))

    expect(screen.getByTestId(SEARCH_INPUT)).toBeInTheDocument()
    expect(screen.getByTestId(FILTER_SELECT)).toBeInTheDocument()
  })

  it('telemetry should be called after Apply changes', async () => {
    const sendEventTelemetryMock = vi.fn();
    (sendEventTelemetry as Mock).mockImplementation(() => sendEventTelemetryMock)
    const value = 'val'
    const responsePayload = { data: [], status: 200 }

    apiService.post = vi.fn().mockResolvedValue(responsePayload)
    render(<KeyTreeFilter />)

    fireEvent.click(screen.getByTestId(TREE_FILTER_TRIGGER_BTN))

    fireEvent.change(screen.getByTestId(SEARCH_INPUT), { target: { value } })

    fireEvent.click(screen.getByTestId(FILTER_SELECT))

    fireEvent.click(await screen.findByText('String'))

    fireEvent.click(screen.getByTestId(APPLY_BTN))

    await waitForStack()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED,
      eventData: {
        databaseId: null,
        databaseSize: undefined,
        keyType: 'string',
        match: 'EXACT_VALUE_NAME',
        numberOfKeysScanned: undefined,
        scanCount: 10000,
        source: 'manual',
      },
    });

    (sendEventTelemetry as Mock).mockRestore()
  })

  it('"setFilterAndSearch" should be called with search="" and filter=null after click on Clear', async () => {
    const useKeysInContextMock = vi.spyOn(useKeys, 'useKeysInContext')
    const setFilterAndSearchMock = vi.fn()

    useKeysInContextMock.mockImplementation(() => ({
      filter: ALL_KEY_TYPES_VALUE,
      searchInit: '',
      setFilterAndSearch: setFilterAndSearchMock,
    }))

    const value = '123'
    render(<KeyTreeFilter />)

    fireEvent.click(screen.getByTestId(TREE_FILTER_TRIGGER_BTN))

    fireEvent.change(screen.getByTestId(SEARCH_INPUT), { target: { value } })

    fireEvent.click(screen.getByTestId(FILTER_SELECT))

    fireEvent.click(screen.getAllByText('String')?.[0])

    fireEvent.click(screen.getByTestId(CLEAR_BTN))

    expect(setFilterAndSearchMock).toBeCalled()
  })
})
