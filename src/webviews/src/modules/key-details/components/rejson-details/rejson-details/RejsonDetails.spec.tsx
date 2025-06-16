import React from 'react'
import { instance, mock } from 'ts-mockito'
import { stringToBuffer } from 'uiSrc/utils'
import { render, screen, fireEvent } from 'testSrc/helpers'
import { RejsonDetails } from './RejsonDetails'
import { BaseProps } from '../interfaces'
import * as useRejson from '../hooks/useRejsonStore'

const mockedProps = mock<BaseProps>()

const mockedJSONObject = [
  {
    key: '_id',
    path: '["_id"]',
    cardinality: 1,
    type: 'string',
    value: '60adf79282e738b05531b345',
  },
  {
    key: '_id2',
    path: '["_id2"]',
    cardinality: 1,
    type: 'string',
    value: '60adf79282b05531b345',
  },
  {
    key: '_id3',
    path: '["_id3"]',
    cardinality: 3,
    type: 'array',
    value: [1, 2, 3],
  },
]

const mockedJSONString = 'string'
const mockedJSONNull = null
const mockedJSONBoolean = true
const mockedJSONNumber = 123123
const mockedSelectedKey = stringToBuffer('key')

const spyAppendReJSONArrayItemAction = vi.spyOn(useRejson, 'appendReJSONArrayItemAction')
const spyFetchVisualisationResults = vi.spyOn(useRejson, 'fetchVisualisationResults')
const spyRemoveReJSONKeyAction = vi.spyOn(useRejson, 'removeReJSONKeyAction')
const spySetReJSONDataAction = vi.spyOn(useRejson, 'setReJSONDataAction')

describe('RejsonDetails', () => {
  beforeEach(() => {
    spyAppendReJSONArrayItemAction.mockReset()
    spyFetchVisualisationResults.mockReset()
    spyRemoveReJSONKeyAction.mockReset()
    spySetReJSONDataAction.mockReset()
  })
  it('should render', () => {
    expect(render(
      <RejsonDetails
        {...instance(mockedProps)}
        selectedKey={mockedSelectedKey}
      />,
    )).toBeTruthy()
  })

  describe('should render JSON object', () => {
    it('should be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONObject}
          dataType="object"
          selectedKey={mockedSelectedKey}
          isDownloaded={false}
        />,
      )).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONObject}
          dataType="object"
          selectedKey={mockedSelectedKey}
          isDownloaded
        />,
      )).toBeTruthy()
    })
  })

  describe('should render JSON array', () => {
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={[1, 2, 3]}
          dataType="array"
          selectedKey={mockedSelectedKey}
          isDownloaded
        />,
      )).toBeTruthy()
    })
  })

  describe('should render JSON string', () => {
    it('should be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONString}
          dataType="string"
          parentPath="."
          selectedKey={mockedSelectedKey}
          isDownloaded={false}
        />,
      )).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONString}
          dataType="string"
          parentPath="."
          selectedKey={mockedSelectedKey}
          isDownloaded
        />,
      )).toBeTruthy()
    })
  })

  describe('should render JSON null', () => {
    it('should be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONNull}
          dataType="null"
          parentPath="."
          selectedKey={mockedSelectedKey}
          isDownloaded={false}
        />,
      )).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONNull}
          dataType="null"
          parentPath="."
          selectedKey={mockedSelectedKey}
          isDownloaded
        />,
      )).toBeTruthy()
    })
  })

  it('should render JSON boolean', () => {
    expect(render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={mockedJSONBoolean}
        dataType="boolean"
        parentPath="."
        selectedKey={mockedSelectedKey}
      />,
    )).toBeTruthy()
  })

  it('should render JSON number', () => {
    expect(render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={mockedJSONNumber}
        dataType="number"
        parentPath="."
        selectedKey={mockedSelectedKey}
      />,
    )).toBeTruthy()
  })

  it('should open inline editor to add JSON key value for object', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      dataType="object"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    expect(screen.getByTestId('json-key')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toBeInTheDocument()
  })

  it('should be able to add proper key value into json object', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      dataType="object"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(
      screen.getByTestId('json-key'),
      {
        target: { value: '"key"' },
      },
    )
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '"value"' },
      },
    )
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(useRejson.setReJSONDataAction).toBeCalled()
    expect(useRejson.appendReJSONArrayItemAction).not.toBeCalled()
  })

  it('should not be able to add wrong key value into json object', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      dataType="object"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(
      screen.getByTestId('json-key'),
      {
        target: { value: '"key"' },
      },
    )
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '{' },
      },
    )
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(useRejson.setReJSONDataAction).not.toBeCalled()
    expect(useRejson.appendReJSONArrayItemAction).not.toBeCalled()
  })

  it('should be able to add proper value into json array', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={[1, 2, 3]}
      dataType="array"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '1' },
      },
    )
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(useRejson.setReJSONDataAction).not.toBeCalled()
    expect(useRejson.appendReJSONArrayItemAction).toBeCalled()
  })

  it('should not be able to add wrong value into json array', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={[1, 2, 3]}
      dataType="array"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '{' },
      },
    )

    expect(useRejson.setReJSONDataAction).not.toBeCalled()
    expect(useRejson.appendReJSONArrayItemAction).not.toBeCalled()
  })

  it('should submit to add proper key value into json object', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      dataType="object"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(
      screen.getByTestId('json-key'),
      {
        target: { value: '"key"' },
      },
    )
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '"value"' },
      },
    )
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(useRejson.setReJSONDataAction).toBeCalled()
    expect(useRejson.appendReJSONArrayItemAction).not.toBeCalled()
  })

  it('should submit to add proper value into json array', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={[1, 2, 3]}
      dataType="array"
      selectedKey={mockedSelectedKey}
      isDownloaded
    />)

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '1' },
      },
    )
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(useRejson.setReJSONDataAction).not.toBeCalled()
    expect(useRejson.appendReJSONArrayItemAction).toBeCalled()
  })

  it('should show confirmation dialog when adding a key that already exists', () => {
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={{ existingKey: '123' }}
        dataType="object"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-object-btn'))

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"existingKey"' },
    })

    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"newValue"' },
    })

    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByText('Duplicate JSON key detected')).toBeInTheDocument()
    expect(useRejson.setReJSONDataAction).not.toBeCalled()
  })

  it('should call setReJSONDataAction when user confirms overwrite', () => {
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={{ existingKey: '123' }}
        dataType="object"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-object-btn'))

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"existingKey"' },
    })

    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"newValue"' },
    })

    fireEvent.click(screen.getByTestId('apply-btn'))

    const confirmBtn = screen.getByTestId('confirm-btn')
    fireEvent.click(confirmBtn)

    expect(useRejson.setReJSONDataAction).toBeCalledWith(
      mockedSelectedKey,
      '["existingKey"]',
      '"newValue"',
      undefined, // length is not required
      expect.any(Function), // callback is not required
    )
  })
})
