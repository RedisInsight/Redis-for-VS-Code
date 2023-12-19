import React, { PropsWithChildren } from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { DatabaseWrapper } from './DatabaseWrapper'

const mockedProps = mock<PropsWithChildren>(<div />)

describe('DatabaseWrapper', () => {
  it('should render', () => {
    expect(render(<DatabaseWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
