import React from 'react'

import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import { render } from 'testSrc/helpers'
import { KeyDetailsPage } from './KeyDetailsPage'

vi.spyOn(useDatabases, 'fetchDatabaseOverview')

describe('KeyDetailsPage', () => {
  it('should render', () => {
    expect(render(<KeyDetailsPage />)).toBeTruthy()
  })
  it('should call fetchDatabaseOverview', () => {
    expect(render(<KeyDetailsPage />)).toBeTruthy()
    expect(useDatabases.fetchDatabaseOverview).toBeCalled()
  })
})
