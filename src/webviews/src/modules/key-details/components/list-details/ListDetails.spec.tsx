import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, ListDetails } from './ListDetails'

const mockedProps = mock<Props>()

describe('ListDetails', () => {
  it('should render', () => {
    expect(render(<ListDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})
