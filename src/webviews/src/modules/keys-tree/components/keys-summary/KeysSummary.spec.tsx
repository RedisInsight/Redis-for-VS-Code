import React from 'react'
import { Mock } from 'vitest'

import * as useContext from 'uiSrc/store/hooks/use-context/useContext'
import * as utils from 'uiSrc/utils'
import { vscodeApi } from 'uiSrc/services'
import { SortOrder, VscodeMessageAction } from 'uiSrc/constants'
import { TelemetryEvent } from 'uiSrc/utils'
import { constants, fireEvent, render, waitForStack } from 'testSrc/helpers'
import { KeysSummary, Props } from './KeysSummary'

const mockDatabase = constants.DATABASE
const mockedProps: Props = {
  database: mockDatabase,
  total: 1,
  scanned: 1,
  resultsLength: 1,
  loading: false,
  nextCursor: '0',
}

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(vscodeApi, 'postMessage')

const setKeysTreeSortMock = vi.fn()
const resetKeysTreeMock = vi.fn();

(vi.spyOn(useContext, 'useContextApi') as Mock).mockImplementation(() => ({
  setKeysTreeSort: setKeysTreeSortMock,
  resetKeysTree: resetKeysTreeMock,
}))

describe('KeysSummary', () => {
  it.todo('should "Scanning..." be in the document until loading and total == 0 ', () => {
    const { queryByTestId } = render(
      <KeysSummary {...mockedProps} loading total={0} />,
    )
    expect(queryByTestId('scanning-text')).toBeInTheDocument()
  })

  it('should Keys summary be in the document meanwhile total != 0 ', () => {
    const { queryByTestId } = render(
      <KeysSummary {...mockedProps} total={2} />,
    )
    expect(queryByTestId('keys-summary')).toBeInTheDocument()
  })

  it('should Keys summary show proper text with count = 1', () => {
    const { queryByTestId } = render(
      <KeysSummary {...mockedProps} scanned={1} resultsLength={1} total={1} />,
    )
    expect(queryByTestId('keys-summary')).toHaveTextContent('(1/1)')
  })

  it('should Keys summary show proper text with count > 1', () => {
    const { queryByTestId } = render(
      <KeysSummary {...mockedProps} scanned={2} resultsLength={2} total={2} />,
    )
    expect(queryByTestId('keys-summary')).toHaveTextContent('(2/2)')
  })

  it('should call setKeysTreeSort and resetKeysTree actions after click on sorting icon', async () => {
    const { queryByTestId } = render(<KeysSummary {...mockedProps} />)

    fireEvent.click(queryByTestId('sort-keys')!)
    await waitForStack()

    expect(useContext.useContextApi().setKeysTreeSort).toBeCalledWith(mockDatabase.id, SortOrder.DESC)
    expect(useContext.useContextApi().resetKeysTree).toBeCalled()
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: 'TREE_VIEW_KEYS_SORTED',
      eventData: {
        databaseId: constants.TEST_DATABASE_ID,
        sorting: 'DESC',
      },
    })
  })

  it('should call sendEventTelemetry and postMessage actions after click on Add Key icon', async () => {
    const { queryByTestId } = render(<KeysSummary {...mockedProps} />)

    fireEvent.click(queryByTestId('add-key-button')!)

    expect(vscodeApi.postMessage).toBeCalledWith({
      action: VscodeMessageAction.AddKey, data: mockDatabase,
    })

    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      eventData: {
        databaseId: mockDatabase.id,
      },
    })
  })
})
