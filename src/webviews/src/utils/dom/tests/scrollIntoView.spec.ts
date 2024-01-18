import { scrollIntoView } from 'uiSrc/utils'

describe('scrollIntoView', () => {
  it('should called with options for all browser except Safari', () => {
    const mockScrollIntoView = vi.fn()
    const opts: ScrollIntoViewOptions = {
      behavior: 'smooth',
      inline: 'end',
      block: 'nearest',
    }
    const newDiv = document.createElement('div')
    newDiv.scrollIntoView = mockScrollIntoView
    scrollIntoView(newopts)
    expect(mockScrollIntoView).toBeCalledWith(opts)
  })

  it('should called with "true" instead of options for Safari', () => {
    const mockScrollIntoView = vi.fn()
    const opts: ScrollIntoViewOptions = {
      behavior: 'smooth',
      inline: 'end',
      block: 'nearest',
    }

    Object.defineProperty(global.document.documentElement, 'style', { value: {} })
    const newDiv = document.createElement('div')
    newDiv.scrollIntoView = mockScrollIntoView
    scrollIntoView(newopts)
    expect(mockScrollIntoView).toBeCalledWith(true)
  })
})
