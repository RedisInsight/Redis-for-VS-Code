import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Link, Props } from './Link'

const mockedProps = mock<Props>()

describe('Link', () => {
  it('should render', () => {
    expect(render(<Link {...instance(mockedProps)} />)).toBeTruthy()
  })
})
