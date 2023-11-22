import React from 'react'
import { instance, mock } from 'ts-mockito'

import { TelemetryEvent, bufferToString, sendEventTelemetry } from 'uiSrc/utils'

import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { useSelectedKeyStore } from 'uiSrc/store'
import { render, screen, fireEvent, act, constants } from 'testSrc/helpers'
import { KEY_INFO } from 'testSrc/handlers/browser'
import { StringDetailsValue, Props } from './StringDetailsValue'
import { useStringStore, initialState as initialStateInit } from '../hooks/useStringStore'
import * as stringConstants from '../constants/string'

const STRING_VALUE = 'string-value'
const STRING_VALUE_SPACE = 'string value'
const LOAD_ALL_BTN = 'load-all-value-btn'
const DOWNLOAD_BTN = 'download-all-value-btn'

const STRING_MAX_LENGTH = 2
const STRING_LENGTH = 4
const MAX_LENGTH = 2

const fullValue = { type: 'Buffer', data: [49, 50, 51, 52] }
const partValue = { type: 'Buffer', data: [49, 50] }

const mockedProps = mock<Props>()

// vi.mock('uiSrc/slices/browser/string', async () => ({
//   ...(await vi.importActual<object>('uiSrc/slices/browser/string')),
//   stringDataSelector: vi.fn().mockReturnValue({
//     value: fullValue,
//   }),
//   fetchDownloadStringValue: vi.fn(),
// }))

// vi.mock('uiSrc/slices/browser/keys', async () => ({
//   ...(await vi.importActual<object>('uiSrc/slices/browser/keys')),
//   selectedKeyDataSelector: vi.fn().mockReturnValue({
//     name: fullValue,
//     type: 'string',
//     length: STRING_LENGTH,
//   }),
// }))

vi.spyOn(stringConstants, 'MAX_LENGTH', 'get').mockReturnValue(MAX_LENGTH)

// vi.mock('uiSrc/slices/instances/instances', async () => ({
//   ...(await vi.importActual<object>('uiSrc/slices/instances/instances')),
//   connectedInstanceSelector: vi.fn().mockReturnValue({
//     compressor: null,
//   }),
// }))

vi.mock('uiSrc/utils', async () => ({
  ...(await vi.importActual<object>('uiSrc/utils')),
  sendEventTelemetry: vi.fn(),
}))

const initialStringState = { keyName: constants.KEY_NAME_1, value: constants.KEY_VALUE_1 }
beforeEach(() => {
  useSelectedKeyStore.setState((state) => ({ ...state, data: KEY_INFO }))
  useStringStore.setState((state) => ({ ...state, ...initialStringState }))
})

describe('StringDetailsValue', () => {
  it('should render', () => {
    expect(
      render(
        <StringDetailsValue
          {...instance(mockedProps)}
        />,
      ),
    ).toBeTruthy()
  })

  it.todo('should render textarea if edit mode', () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={vi.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    expect(textArea).toBeInTheDocument()
  })

  it.todo('should update string value', () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={vi.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } },
    )
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  it.todo('should stay empty string after cancel', async () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={vi.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } },
    )
    const btnACancel = screen.getByTestId('cancel-btn')
    await act(() => {
      fireEvent.click(btnACancel)
    })
    const textArea2 = screen.getByTestId(STRING_VALUE)
    expect(textArea2).toHaveValue(bufferToString(fullValue))
  })

  it.todo('should update value after apply', () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={vi.fn()}
      />,
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } },
    )
    const btnApply = screen.getByTestId('apply-btn')
    fireEvent.click(btnApply)
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  it('should render load button and download button if long string is partially loaded', () => {
    useStringStore.setState((state) => ({
      ...state,
      data: { value: partValue },
    }))

    render(
      <StringDetailsValue {...instance(mockedProps)} />,
    )
    const loadAllBtn = screen.getByTestId(LOAD_ALL_BTN)
    // const downloadBtn = screen.getByTestId(DOWNLOAD_BTN)
    expect(loadAllBtn).toBeInTheDocument()
    // expect(downloadBtn).toBeInTheDocument()
  })

  it.todo('should call onRefresh and sendEventTelemetry after clicking on load button', () => {
    const onRefresh = vi.fn()
    useStringStore.setState((state) => ({
      ...state,
      data: { value: partValue },
    }))

    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByTestId(LOAD_ALL_BTN))

    expect(onRefresh).toBeCalled()
    expect(onRefresh).toBeCalledWith(fullValue, 'string', { end: STRING_MAX_LENGTH + 1 })
    expect(sendEventTelemetry).toBeCalled()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.STRING_LOAD_ALL_CLICKED,
      eventData: { databaseId: undefined, length: STRING_LENGTH },
    })
  })

  it('Should add "..." in the end of the part value', async () => {
    useStringStore.setState((state) => ({
      ...state,
      data: { value: partValue },
    }))

    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent(`${bufferToString(partValue)}...`)
  })

  it('Should not add "..." in the end of the full value', async () => {
    useStringStore.setState((state) => ({
      ...state,
      data: { value: fullValue },
    }))

    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent(bufferToString(fullValue))
  })

  it.todo('should call fetchDownloadStringValue and sendEventTelemetry after clicking on load button and download button', async () => {
    useStringStore.setState((state) => ({
      ...state,
      data: { value: partValue },
    }))

    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )

    fireEvent.click(screen.getByTestId(DOWNLOAD_BTN))

    expect(sendEventTelemetry).toBeCalled()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.STRING_DOWNLOAD_VALUE_CLICKED,
      eventData: { databaseId: undefined, length: STRING_LENGTH },
    })
    // expect(fetchDownloadStringValue).toBeCalled()
    // expect(fetchDownloadStringValue).toBeCalledWith(fullValue, downloadFile)
  })

  // describe('decompressed  data', () => {
  //   it('should render decompressed GZIP data = "1"', () => {
  //     const stringDataSelectorMock = vi.fn().mockReturnValue({
  //       value: anyToBuffer(GZIP_COMPRESSED_VALUE_1),
  //     })
  //     stringDataSelector.mockImplementation(stringDataSelectorMock)

  //     connectedInstanceSelector.mockImplementation(() => ({
  //       compressor: KeyValueCompressor.GZIP,
  //     }))

  //     render(
  //       <StringDetailsValue
  //         {...instance(mockedProps)}
  //         isEditItem
  //         setIsEdit={vi.fn()}
  //       />,
  //     )
  //     const textArea = screen.getByTestId(STRING_VALUE)

  //     expect(textArea).toHaveValue(DECOMPRESSED_VALUE_STR_1)
  //   })

  //   it('should render decompressed GZIP data = "2"', () => {
  //     const stringDataSelectorMock = vi.fn().mockReturnValue({
  //       value: anyToBuffer(GZIP_COMPRESSED_VALUE_2),
  //     })
  //     stringDataSelector.mockImplementation(stringDataSelectorMock)

  //     connectedInstanceSelector.mockImplementation(() => ({
  //       compressor: KeyValueCompressor.GZIP,
  //     }))

  //     render(
  //       <StringDetailsValue
  //         {...instance(mockedProps)}
  //         isEditItem
  //         setIsEdit={vi.fn()}
  //       />,
  //     )
  //     const textArea = screen.getByTestId(STRING_VALUE)

  //     expect(textArea).toHaveValue(DECOMPRESSED_VALUE_STR_2)
  //   })
  // })
})
