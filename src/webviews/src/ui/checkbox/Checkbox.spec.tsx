import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Checkbox, Props } from './Checkbox'

const mockedProps = mock<Props>()

describe('Checkbox', () => {
  it('should render', () => {
    expect(render(<Checkbox {...instance(mockedProps)} />)).toBeTruthy()
  })
})
