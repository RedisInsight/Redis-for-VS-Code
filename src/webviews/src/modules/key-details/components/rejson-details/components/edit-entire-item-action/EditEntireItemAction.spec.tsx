import React from 'react'
import { instance, mock } from 'ts-mockito'
import { screen, fireEvent } from 'testSrc/helpers'
import { JSONErrors } from '../../constants'

const mockedProps = mock<any>()
const valueOfEntireItem = '"Sample string"'

async function renderWithMockedMonaco(props: any) {
  vi.resetModules()
  vi.doMock('react-monaco-editor', () => ({
    default: ({ value, onChange, 'data-testid': dataTestId }: any) => (
      <textarea
        data-testid={dataTestId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ),
  }))

  const { EditEntireItemAction } = await import('./EditEntireItemAction')
  const { render } = await import('testSrc/helpers')
  return render(<EditEntireItemAction {...props} />)
}

describe('EditEntireItemAction', () => {
  it('renders correctly with provided props', async () => {
    await renderWithMockedMonaco({
      ...instance(mockedProps),
      initialValue: valueOfEntireItem,
    })

    expect(screen.getByTestId('json-value')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toHaveValue(valueOfEntireItem)
  })

  it('triggers handleUpdateValueFormSubmit when the form is submitted', async () => {
    const handleUpdateValueFormSubmit = vi.fn()

    await renderWithMockedMonaco({
      ...instance(mockedProps),
      initialValue: valueOfEntireItem,
      onSubmit: handleUpdateValueFormSubmit,
    })

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(handleUpdateValueFormSubmit).toHaveBeenCalled()
  })

  it('should show error and not submit', async () => {
    const handleUpdateValueFormSubmit = vi.fn()

    await renderWithMockedMonaco({
      ...instance(mockedProps),
      initialValue: 'xxxx',
      onSubmit: handleUpdateValueFormSubmit,
    })

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(
      JSONErrors.valueJSONFormat,
    )
    expect(handleUpdateValueFormSubmit).not.toHaveBeenCalled()
  })
})
