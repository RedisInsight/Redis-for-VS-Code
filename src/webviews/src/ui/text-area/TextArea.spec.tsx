import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { TextArea, Props } from './TextArea'

const mockedProps = mock<Props>()

describe('TextArea', () => {
  it('should render', () => {
    expect(render(<TextArea {...instance(mockedProps)} />)).toBeTruthy()
  })
})
