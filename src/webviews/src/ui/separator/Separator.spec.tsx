import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Separator, Props } from './Separator'

const mockedProps = mock<Props>()

describe('Separator', () => {
  it('should render', async () => {
    expect(render(<Separator {...instance(mockedProps)} />)).toBeTruthy()
  })
})
