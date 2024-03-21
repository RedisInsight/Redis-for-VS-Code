import { ReactElement } from 'react'
import { render } from 'testSrc/helpers'
import { getRequiredFieldsText } from 'uiSrc/utils'

const addUtmToLinkTests = [
  [{}, null],
  [{keyName: 'Key Name'}, 'Enter a value for required fields (1):'],
  [{keyName: 'Key Name'}, 'Key Name'],
  [{keyName: 'Key Name', ttl: 'ttl'}, 'Enter a value for required fields (2):'],
  [{keyName: 'Key Name', ttl: 'ttl'}, 'ttl'],
]

describe('getRequiredFieldsText', () => {
  test.each(addUtmToLinkTests)(
    'for input: %s should be output: %s',
    // @ts-ignore
    (input, expected) => {
      const result = getRequiredFieldsText(input as any)

      if (expected) {
        const { container} = render(result as ReactElement)
        expect(container).toHaveTextContent(`${expected}`)
        return
      }
      expect(result).toEqual(expected)
    }
  )
})
