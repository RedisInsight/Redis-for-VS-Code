import React from 'react'

import * as useSelectedKey from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { constants, render } from 'testSrc/helpers'
import { KeyDetailsPage } from './KeyDetailsPage'

vi.spyOn(useSelectedKey, 'fetchKeyInfo')

beforeEach(() => {
  vi.stubGlobal('ri', { })
})

describe('KeyDetailsPage', () => {
  it('should render', () => {
    expect(render(<KeyDetailsPage />)).toBeTruthy()
  })
  it('should call fetchKeyInfo', () => {
    vi.stubGlobal('ri', { database: constants.DATABASE, keyInfo: { key: constants.KEY_NAME_1 } })
    expect(render(<KeyDetailsPage />)).toBeTruthy()
    expect(useSelectedKey.fetchKeyInfo).toBeCalled()
  })
})
