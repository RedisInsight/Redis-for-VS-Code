import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from '@testing-library/react'

import { Props, KeyRowName } from './KeyRowName'

const mockedProps = mock<Props>()

const loadingTestId = 'name-loading'

describe('KeyRowName', () => {
  it('should render', () => {
    expect(render(<KeyRowName {...instance(mockedProps)} />)).toBeTruthy()
  })

  it.todo('should render Loading if no nameString', () => {
    const { queryByTestId } = render(<KeyRowName nameString={undefined} />)

    expect(queryByTestId(loadingTestId)).toBeInTheDocument()
  })

  it('content should be no more than 200 symbols', () => {
    const longName = Array.from({ length: 250 }, () => '1').join('')
    const { queryByTestId } = render(<KeyRowName shortString={longName} />)

    expect(queryByTestId(loadingTestId)).not.toBeInTheDocument()
    expect(queryByTestId(`key-${longName}`)).toHaveTextContent(longName.slice(0, 200))
  })
})
