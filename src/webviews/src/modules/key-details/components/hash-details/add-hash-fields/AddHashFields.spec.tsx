import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Mock } from 'vitest'
import * as useDatabases from 'uiSrc/store/hooks/use-databases-store/useDatabasesStore'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { Props, AddHashFields } from './AddHashFields'

const HASH_FIELD = 'hash-field'
const HASH_VALUE = 'hash-value'
const HASH_FIELD_ZERO = 'hash-field-0'
const HASH_VALUE_ZERO = 'hash-value-0'
const HASH_FIELD_TTL_ZERO = 'hash-ttl-0'

const mockedProps = mock<Props>()

describe('AddHashFields', () => {
  it('should render', () => {
    expect(render(<AddHashFields {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set field name properly', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_FIELD_ZERO)
    fireEvent.change(
      fieldName,
      { target: { value: 'field name' } },
    )
    expect(fieldName).toHaveValue('field name')
  })

  it('should set field value properly', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_VALUE_ZERO)
    fireEvent.change(
      fieldName,
      { target: { value: '123' } },
    )
    expect(fieldName).toHaveValue('123')
  })

  it('should render add button', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should render one more field name & value inputs after click add item', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getByTestId(HASH_FIELD_ZERO)).toBeInTheDocument()
    expect(screen.getByTestId(`${HASH_FIELD}-1`)).toBeInTheDocument()
    expect(screen.getByTestId(HASH_VALUE_ZERO)).toBeInTheDocument()
    expect(screen.getByTestId(`${HASH_VALUE}-1`)).toBeInTheDocument()
  })

  it('should clear fieldName & fieldValue after click clear button', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_FIELD_ZERO)
    const fieldValue = screen.getByTestId(HASH_VALUE_ZERO)
    fireEvent.change(
      fieldName,
      { target: { value: 'name' } },
    )
    fireEvent.change(
      fieldValue,
      { target: { value: 'val' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(fieldName).toHaveValue('')
    expect(fieldValue).toHaveValue('')
  })

  it('should render ttl input if redis version > 7.4', () => {
    (vi.spyOn(useDatabases, 'useDatabasesStore') as Mock).mockImplementation(() => '7.4')

    render(<AddHashFields {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getByTestId(HASH_FIELD_ZERO)).toBeInTheDocument()
    expect(screen.getByTestId(HASH_VALUE_ZERO)).toBeInTheDocument()
    expect(screen.getByTestId(HASH_FIELD_TTL_ZERO)).toBeInTheDocument()
  })
})
