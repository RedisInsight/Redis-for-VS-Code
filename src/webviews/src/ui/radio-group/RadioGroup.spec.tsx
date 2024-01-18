import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { RadioGroup, Props } from './RadioGroup'

const mockedProps = mock<Props>()

describe('RadioGroup', () => {
  it('should render', () => {
    expect(render(<RadioGroup {...instance(mockedProps)} />)).toBeTruthy()
  })
})
