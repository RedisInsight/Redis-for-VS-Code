import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen, act, waitForStack, constants } from 'testSrc/helpers'

import { RejsonObject } from './RejsonObject'
import * as pathUtils from '../utils/path'
import * as store from '../hooks/useRejsonStore'
import { JSONObjectProps, ObjectTypes } from '../interfaces'

const EXPAND_OBJECT = 'expand-object'
const JSON_VALUE = 'json-value'
const JSON_KEY = 'json-key'
const JSON_SCALAR_VALUE_ID = 'json-scalar-value'
const EDIT_OBJECT_BTN = 'edit-json-field'

const mockedProps = mock<JSONObjectProps>()

vi.mock('uiSrc/slices/browser/rejson', async () => ({
  ...(await vi.importActual('uiSrc/slices/browser/rejson')),
  setReJSONDataAction: vi.fn,
  fetchVisualisationResults: vi.fn().mockReturnValue(
    Promise.resolve({ data: constants.REJSON_DATA }),
  ),
}))

describe('JSONObject', () => {
  it('should render', () => {
    expect(render(
      <RejsonObject
        {...instance(mockedProps)}
        value={constants.REJSON_DATA}
        keyName="keyName"
      />,
    )).toBeTruthy()
  })

  it('should expand simple downloaded JSON', async () => {
    const { findAllByTestId } = render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA}
      isDownloaded
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    expect(await findAllByTestId(JSON_SCALAR_VALUE_ID)).toHaveLength(4)
  })

  it('should render and expand downloaded JSON with objects', async () => {
    const { findAllByTestId } = render(<RejsonObject
      {...instance(mockedProps)}
      value={constants.REJSON_DATA_OBJECT}
      isDownloaded
      keyName=""
      type={ObjectTypes.Object}
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    expect(await findAllByTestId(JSON_SCALAR_VALUE_ID)).toHaveLength(4)
  })

  it('should render and expand downloaded JSON with array', async () => {
    const { findAllByTestId } = render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA_ARRAY}
      isDownloaded
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    fireEvent.click(screen.getByTestId(EXPAND_OBJECT))

    fireEvent.click(screen.getByTestId('expand-array'))

    expect(await findAllByTestId(JSON_SCALAR_VALUE_ID)).toHaveLength(3)
  })

  it('should render simple not downloaded JSON', async () => {
    const fetchVisualisationResults = vi.fn().mockReturnValue(
      Promise.resolve({ data: Array.from({ length: 4 }).fill(constants.REJSON_DATA) }),
    )
    const { findAllByTestId } = render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA}
      isDownloaded={false}
      onJsonKeyExpandAndCollapse={vi.fn()}
      handleFetchVisualisationResults={fetchVisualisationResults}
    />)

    fireEvent.click(screen.getByTestId(EXPAND_OBJECT))

    expect(await findAllByTestId(JSON_SCALAR_VALUE_ID)).toHaveLength(4)
  })

  it('should render inline editor to add', async () => {
    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA}
      isDownloaded
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(/expand-object/i))
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId(/add-field-btn/i))
    })

    expect(screen.getByTestId('apply-btn')).toBeInTheDocument()
  })

  it('should not be able to add value with wrong json', async () => {
    const onJSONPropertyAdded = vi.fn()
    const fetchVisualisationResults = vi.fn().mockReturnValue(
      Promise.resolve({ data: {} }),
    )
    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      type={ObjectTypes.Object}
      value={constants.REJSON_DATA}
      isDownloaded
      handleFetchVisualisationResults={fetchVisualisationResults}
      handleAppendRejsonObjectItemAction={onJSONPropertyAdded}
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(/expand-object/i))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/add-field-btn/i))
    })

    fireEvent.input(screen.getByTestId(JSON_KEY), {
      target: { value: '"key' },
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{' },
    })

    expect(onJSONPropertyAdded).not.toBeCalled()
  })

  it('should apply proper value to add element in object', async () => {
    const onJSONPropertyAdded = vi.fn()

    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      type={ObjectTypes.Object}
      value={constants.REJSON_DATA}
      isDownloaded
      handleSetRejsonDataAction={onJSONPropertyAdded}
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('add-field-btn'))
    })

    fireEvent.input(screen.getByTestId(JSON_KEY), {
      target: { value: '"key"' },
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' },
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(onJSONPropertyAdded).toBeCalled()
  })

  it('should render inline editor to edit value', async () => {
    const fetchVisualisationResults = vi.fn().mockReturnValue(
      Promise.resolve({ data: {} }),
    )
    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      type={ObjectTypes.Object}
      handleFetchVisualisationResults={fetchVisualisationResults}
      value={constants.REJSON_DATA}
      isDownloaded
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))

    await waitForStack()

    expect(screen.getByTestId(JSON_VALUE)).toBeInTheDocument()
  })

  it('should change value when editing', async () => {
    const fetchVisualisationResults = vi.fn().mockReturnValue(
      Promise.resolve({ data: {} }),
    )

    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA}
      isDownloaded
      handleFetchVisualisationResults={fetchVisualisationResults}
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' },
    })

    expect(screen.getByTestId(JSON_VALUE)).toHaveValue('{}')
  })

  it('should not apply wrong value for edit', async () => {
    const onJSONPropertyEdited = vi.fn()
    const fetchVisualisationResults = vi.fn().mockReturnValue(
      Promise.resolve({ data: {} }),
    )
    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA}
      handleFetchVisualisationResults={fetchVisualisationResults}
      isDownloaded
      handleSetRejsonDataAction={onJSONPropertyEdited}
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{' },
    })

    expect(onJSONPropertyEdited).not.toBeCalled()
  })

  it('should apply proper value for edit', async () => {
    const fetchVisualisationResults = vi.fn().mockReturnValue(
      Promise.resolve({ data: {} }),
    )
    const onJSONPropertyEdited = vi.fn()
    render(<RejsonObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={constants.REJSON_DATA}
      isDownloaded
      handleFetchVisualisationResults={fetchVisualisationResults}
      handleSetRejsonDataAction={onJSONPropertyEdited}
      onJsonKeyExpandAndCollapse={vi.fn()}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: JSON.stringify([]) },
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-edit-btn'))
    })

    expect(onJSONPropertyEdited).toBeCalled()
  })

  it('should apply value for edit with modifications (via ConfirmDialog)', async () => {
    const fetchVisualisationResults = vi
      .fn()
      .mockReturnValue(Promise.resolve({ data: {} }))
    const onJSONPropertyEdited = vi.fn()

    render(
      <RejsonObject
        {...instance(mockedProps)}
        keyName="keyName"
        value={constants.REJSON_DATA}
        isDownloaded
        handleFetchVisualisationResults={fetchVisualisationResults}
        handleSetRejsonDataAction={onJSONPropertyEdited}
        onJsonKeyExpandAndCollapse={vi.fn()}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' },
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-edit-btn'))
    })

    expect(screen.getByText('Duplicate JSON key detected')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    expect(onJSONPropertyEdited).toBeCalled()

    expect(
      screen.queryByText('Duplicate JSON key detected'),
    ).not.toBeInTheDocument()
  })

  it('should close ConfirmDialog without calling action when cancel is clicked on edit with modifications', async () => {
    const fetchVisualisationResults = vi
      .fn()
      .mockReturnValue(Promise.resolve({ data: {} }))
    const onJSONPropertyEdited = vi.fn()

    render(
      <RejsonObject
        {...instance(mockedProps)}
        keyName="keyName"
        value={constants.REJSON_DATA}
        isDownloaded
        handleFetchVisualisationResults={fetchVisualisationResults}
        handleSetRejsonDataAction={onJSONPropertyEdited}
        onJsonKeyExpandAndCollapse={vi.fn()}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' },
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-edit-btn'))
    })

    expect(screen.getByText('Duplicate JSON key detected')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel-btn'))
    })

    expect(onJSONPropertyEdited).not.toBeCalled()

    expect(
      screen.queryByText('Duplicate JSON key detected'),
    ).not.toBeInTheDocument()
  })

  it('should apply new value for existing key after confirming in ConfirmDialog', async () => {
    vi.spyOn(pathUtils, 'checkExistingPath').mockReturnValue(true)
    vi.spyOn(store, 'useRejsonStore').mockReturnValue({
      fullValue: JSON.stringify({ existingKey: 1 }),
    })

    const onSetRejsonDataAction = vi.fn()

    render(
      <RejsonObject
        {...instance(mockedProps)}
        keyName="keyName"
        type={ObjectTypes.Object}
        value={constants.REJSON_DATA}
        isDownloaded
        handleSetRejsonDataAction={onSetRejsonDataAction}
        onJsonKeyExpandAndCollapse={vi.fn()}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('add-field-btn'))
    })

    fireEvent.input(screen.getByTestId(JSON_KEY), {
      target: { value: '"existingKey"' },
    })

    fireEvent.input(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' },
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(screen.getByText('Duplicate JSON key detected')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    expect(onSetRejsonDataAction).toBeCalled()

    expect(
      screen.queryByText('Duplicate JSON key detected'),
    ).not.toBeInTheDocument()
  })
})
