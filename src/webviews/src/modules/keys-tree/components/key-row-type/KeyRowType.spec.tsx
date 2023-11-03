import React from 'react'
import { instance, mock } from 'ts-mockito'

import { KeyTypes } from 'uiSrc/constants'
import { render } from 'testSrc/helpers'
import { Props, KeyRowType } from './KeyRowType'

const mockedProps = mock<Props>()
const loadingTestId = 'type-loading_'
const nameString = 'name'

describe('KeyRowType', () => {
  it('should render', () => {
    expect(render(<KeyRowType {...instance(mockedProps)} />)).toBeTruthy()
  })

  it.todo('should render Loading if no type', () => {
    const { queryByTestId } = render(<KeyRowType
      {...instance(mockedProps)}
    />)

    expect(queryByTestId(loadingTestId + nameString)).toBeInTheDocument()
  })

  it('should render Badge if type exists', () => {
    const type = KeyTypes.Hash
    const { queryByTestId } = render(<KeyRowType
      {...instance(mockedProps)}
      type={type}
    />)

    expect(queryByTestId(loadingTestId + nameString)).not.toBeInTheDocument()
  })
})
