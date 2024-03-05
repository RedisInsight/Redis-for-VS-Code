import React from 'react'
import { instance, mock } from 'ts-mockito'
import * as utils from 'uiSrc/utils'
import { TelemetryEvent } from 'uiSrc/utils'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { constants, fireEvent, render, screen } from 'testSrc/helpers'
import { Props, StringDetails } from './StringDetails'
import { useStringStore, initialState as initialStateInit } from './hooks/useStringStore'
import * as useString from './hooks/useStringStore'
import * as stringConstants from './constants/string'

const mockedProps = mock<Props>()
const EDIT_VALUE_BTN_TEST_ID = 'edit-key-value-btn'
const LOAD_ALL_BTN = 'load-all-value-btn'
const DOWNLOAD_BTN = 'download-all-value-btn'
const MAX_LENGTH = 2

const stringData = { keyName: constants.KEY_NAME_1, value: constants.KEY_1_VALUE }

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(useString, 'fetchString')
vi.spyOn(stringConstants, 'MAX_LENGTH', 'get').mockReturnValue(MAX_LENGTH)

beforeEach(() => {
  useStringStore.setState((initialStateInit))
})

describe('StringDetails', () => {
  it('should render', () => {
    expect(render(<StringDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should be able to change value (long string fully load)', () => {
    useSelectedKeyStore.useSelectedKeyStore.setState((state) => ({
      ...state,
      data: {
        ...state.data,
        length: 5,
      },
    }))
    useStringStore.setState((state) => ({
      ...state,
      data: stringData,
    }))

    render(<StringDetails {...mockedProps} />)

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', false)
  })

  it('should not be able to change value (long string not fully load)', () => {
    const initialState = {
      value: {
        type: 'Buffer',
        data: [49, 50, 51],
      },
    }

    useStringStore.setState((state) => ({ ...state, ...initialState }))

    render(
      <StringDetails
        {...mockedProps}
      />,
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', true)
  })

  it('"edit-key-value-btn" should render', () => {
    const { queryByTestId } = render(<StringDetails {...instance(mockedProps)} />)
    expect(queryByTestId(EDIT_VALUE_BTN_TEST_ID)).toBeInTheDocument()
  })

  it('should call setSelectedKeyRefreshDisabled after click edit button', () => {
    const setSelectedKeyRefreshDisabledMock = vi.fn()
    const spy = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore').mockImplementation(() => ({
      setRefreshDisabled: setSelectedKeyRefreshDisabledMock,
    }))

    render(<StringDetails {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId(EDIT_VALUE_BTN_TEST_ID)!)
    expect(setSelectedKeyRefreshDisabledMock).toBeCalledWith(true)
    spy.mockRestore()
  })

  describe('telemetry', () => {
    beforeEach(() => {
      useSelectedKeyStore.useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
      useStringStore.setState((state) => ({
        ...state,
        data: stringData,
      }))
    })

    it('telemetry STRING_LOAD_ALL_CLICKED should be sent after click on "Load all"', () => {
      const { queryByTestId } = render(<StringDetails {...instance(mockedProps)} />)

      fireEvent.click(queryByTestId(LOAD_ALL_BTN)!)

      expect(utils.sendEventTelemetry).toBeCalled()
      expect(utils.sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.STRING_LOAD_ALL_CLICKED,
        eventData: { databaseId: undefined, length: constants.KEY_INFO.length },
      })
    })

    it('telemetry STRING_DOWNLOAD_VALUE_CLICKED should be sent after click on "Load all"', () => {
      const { queryByTestId } = render(<StringDetails {...instance(mockedProps)} />)

      fireEvent.click(queryByTestId(DOWNLOAD_BTN)!)

      expect(utils.sendEventTelemetry).toBeCalled()
      expect(utils.sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.STRING_DOWNLOAD_VALUE_CLICKED,
        eventData: { databaseId: undefined, length: constants.KEY_INFO.length },
      })
    })
  })
})
