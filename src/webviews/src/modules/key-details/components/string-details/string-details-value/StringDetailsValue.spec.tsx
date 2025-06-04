import React from 'react'
import { instance, mock } from 'ts-mockito'

import * as utils from 'uiSrc/utils'
import { bufferToASCII, bufferToString } from 'uiSrc/utils'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { useSelectedKeyStore } from 'uiSrc/store'
import { KeyValueFormat } from 'uiSrc/constants'
import * as useContext from 'uiSrc/store/hooks/use-context/useContext'
import { render, screen, fireEvent, constants, waitForStack } from 'testSrc/helpers'
import { StringDetailsValue, Props } from './StringDetailsValue'
import * as useString from '../hooks/useStringStore'
import * as stringConstants from '../constants/string'

const { useStringStore } = useString

const STRING_VALUE = 'string-value'
const STRING_VALUE_SPACE = 'string value'
const LOAD_ALL_BTN = 'load-all-value-btn'
const DOWNLOAD_BTN = 'download-all-value-btn'

const MAX_LENGTH = 2

const mockedProps = mock<Props>()

vi.spyOn(useString, 'fetchDownloadStringValue')
vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(stringConstants, 'MAX_LENGTH', 'get').mockReturnValue(MAX_LENGTH)

const initialStringState = { keyName: constants.KEY_NAME_1, value: constants.KEY_1_VALUE }
beforeEach(() => {
  useSelectedKeyStore.setState((state) => ({ ...state, data: constants.KEY_INFO }))
  useStringStore.setState((state) => ({
    ...state,
    data: initialStringState,
  }))
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

  it('should render textarea if edit mode', () => {
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

  it('should update string value', () => {
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

  it('should stay empty string after cancel', async () => {
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
    const btnCancel = screen.getByTestId('cancel-btn')
    fireEvent.click(btnCancel)
    await waitForStack()

    const textArea2 = screen.getByTestId(STRING_VALUE)
    expect(textArea2).toHaveValue(bufferToString(constants.KEY_1_VALUE))
  })

  it('should update value after apply', () => {
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
    render(
      <StringDetailsValue {...instance(mockedProps)} />,
    )
    const loadAllBtn = screen.getByTestId(LOAD_ALL_BTN)
    const downloadBtn = screen.getByTestId(DOWNLOAD_BTN)
    expect(loadAllBtn).toBeInTheDocument()
    expect(downloadBtn).toBeInTheDocument()
  })

  it('should call onRefresh and sendEventTelemetry after clicking on load button', () => {
    const onRefresh = vi.fn()
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByTestId(LOAD_ALL_BTN))

    expect(onRefresh).toBeCalled()
    expect(onRefresh).toBeCalledWith(constants.KEY_NAME_1, { end: 9 })
  })

  it('Should add "..." in the end of the part value', async () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent(`${bufferToString(constants.KEY_1_VALUE)}...`)
  })

  it('Should render partValue in the Unicode format', async () => {
    useStringStore.setState((state) => ({
      ...state,
      data: { value: constants.VECTOR_32_VALUE_1 },
    }))

    const useContextInContext = vi.spyOn(useContext, 'useContextInContext')
    useContextInContext.mockImplementation(() => KeyValueFormat.Vector32Bit)

    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )

    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent('@...')
    expect(screen.getByTestId(STRING_VALUE)).not.toHaveTextContent('[object Object]')
  })

  it('Should not add "..." in the end of the full value', async () => {
    useStringStore.setState((state) => ({
      ...state,
      data: { value: constants.KEY_1_VALUE_FULL },
    }))

    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )
    expect(screen.getByTestId(STRING_VALUE)).toHaveTextContent(bufferToString(constants.KEY_1_VALUE_FULL))
  })

  it('should call fetchDownloadStringValue and sendEventTelemetry after clicking on load button and download button', async () => {
    render(
      <StringDetailsValue
        {...instance(mockedProps)}
      />,
    )

    fireEvent.click(screen.getByTestId(DOWNLOAD_BTN))

    expect(useString.fetchDownloadStringValue).toBeCalled()
    expect(useString.fetchDownloadStringValue).toBeCalledWith(constants.KEY_NAME_1, downloadFile)
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
