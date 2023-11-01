import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from '@testing-library/react'

import { Props, NoKeysMessage } from './NoKeysMessage'

const mockedProps = mock<Props>()

describe('NoKeysMessage', () => {
  it('should render', () => {
    expect(render(<NoKeysMessage {...mockedProps} />)).toBeTruthy()
  })

  describe('SearchMode = Pattern', () => {
    it('NoKeysFound should be rendered if total=0', () => {
      const { container } = render(<NoKeysMessage {...instance(mockedProps)} total={0} />)
      expect(container).toHaveTextContent('Keys are the foundation of Redis.')
    })
    it('NoKeysFound should be rendered if total!=0', () => {
      const { container } = render(<NoKeysMessage {...instance(mockedProps)} total={1} />)
      expect(container).toHaveTextContent('No results found.')
    })
  })
})
