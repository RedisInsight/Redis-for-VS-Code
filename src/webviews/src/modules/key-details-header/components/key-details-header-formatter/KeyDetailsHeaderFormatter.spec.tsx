import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'

import { Props, KeyDetailsHeaderFormatter } from './KeyDetailsHeaderFormatter'

const mockedProps = {
  ...mock<Props>(),
}

describe('KeyValueFormatter', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderFormatter {...mockedProps} />)).toBeTruthy()
  })

  it('should render options in the strict order', async () => {
    const strictOrder = [
      'Unicode',
      'ASCII',
      'Binary',
      'HEX',
      'JSON',
      'Msgpack',
      'Pickle',
      'Protobuf',
      'PHP serialized',
      'Java serialized',
      'Vector 32-bit',
      'Vector 64-bit',
    ]
    const { queryByTestId } = render(<KeyDetailsHeaderFormatter {...mockedProps} />)

    const selectorEl = screen.getByTestId('select-format-key-value')

    fireEvent.click(selectorEl)

    strictOrder.forEach((formatter, i) => {
      expect(selectorEl.childNodes[i]).toEqual(queryByTestId(`format-option-${formatter}`))
    })
  })
})
