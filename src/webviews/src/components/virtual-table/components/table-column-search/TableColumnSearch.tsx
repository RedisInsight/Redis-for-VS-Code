import React, { ChangeEvent, useState } from 'react'
import { Maybe } from 'uiSrc/interfaces'
import { Keys } from 'uiSrc/constants'
import { InputText } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  appliedValue: string;
  fieldName: string;
  prependSearchName: string;
  onApply?: (value: string) => void;
  searchValidation?: Maybe<(value: string) => string>;
}

const TableColumnSearch = (props: Props) => {
  const {
    fieldName,
    appliedValue,
    prependSearchName,
    onApply = () => {},
    searchValidation,
  } = props
  const [value, setValue] = useState<string>('')

  const handleChangeValue = (initValue: string) => {
    const value = searchValidation ? searchValidation(initValue) : initValue
    setValue(value)
  }

  const handleApply = (_value: string): void => {
    if (appliedValue !== _value) {
      onApply(_value)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === Keys.ENTER) {
      handleApply(value)
    }
  }

  return (
    <div className={styles.search}>
      <InputText
        onKeyDown={onKeyDown}
        name={fieldName}
        // prepend={prependSearchName}
        placeholder="Search"
        value={value || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChangeValue(e.target.value)}
        data-testid="search"
      />
    </div>
  )
}

export { TableColumnSearch }
