import React from 'react'
import { instance, mock } from 'ts-mockito'

import { constants, render } from 'testSrc/helpers'
import { Props, KeyRowDelete } from './KeyRowDelete'

const mockedProps = mock<Props>()

describe('KeyRowDelete', () => {
  it('should render', () => {
    expect(render(<KeyRowDelete {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render PopoverDelete component', () => {
    const { queryByTestId } = render(
      <KeyRowDelete
        {...instance(mockedProps)}
        nameString={constants.KEY_NAME_STRING_1}
        nameBuffer={constants.KEY_NAME_1}
      />,
    )

    expect(queryByTestId(`remove-key-${constants.KEY_NAME_STRING_1}-trigger`)).toBeInTheDocument()
  })
})
