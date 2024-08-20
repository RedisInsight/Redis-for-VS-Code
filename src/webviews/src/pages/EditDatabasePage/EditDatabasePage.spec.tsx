import React from 'react'

import * as useCertificates from 'uiSrc/store'
import { constants, render } from 'testSrc/helpers'
import { EditDatabasePage } from './EditDatabasePage'

vi.spyOn(useCertificates, 'fetchCerts')
beforeEach(() => {
  vi.stubGlobal('ri', { })
})

describe('EditDatabasePage', () => {
  it('should render', () => {
    expect(render(<EditDatabasePage />)).toBeTruthy()
  })

  it('should call fetchCerts', () => {
    vi.stubGlobal('ri', { database: constants.DATABASE, keyInfo: { key: constants.KEY_NAME_1 } })
    expect(render(<EditDatabasePage />)).toBeTruthy()
    expect(useCertificates.fetchCerts).toBeCalled()
  })
})
