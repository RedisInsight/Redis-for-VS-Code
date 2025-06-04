import React, { FC } from 'react'
import cx from 'classnames'
import Select, { CreatableProps } from 'react-select/creatable'
import { GroupBase } from 'react-select'

import { Maybe } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface MultiSelectOption {
  label: string
  value: string
  testid?: string
}

export interface Props extends CreatableProps<MultiSelectOption, true, GroupBase<MultiSelectOption>> {
  options?: Maybe<MultiSelectOption[]>
  selectedOption?: Maybe<MultiSelectOption>
  containerClassName?: string
  itemClassName?: string
  testid?: string
}

const components = {
  DropdownIndicator: null,
}

const MultiSelect: FC<Props> = (props) => {
  const {
    containerClassName,
    testid,
  } = props

  return (
    <div className={cx(styles.container, containerClassName)}>
      <Select<MultiSelectOption, true>
        {...props}
        isMulti
        isClearable
        components={components}
        menuIsOpen={false}
        inputId={testid}
        classNames={{
          container: () => styles.selectContainer,
          control: () => styles.control,
          multiValue: () => styles.multiValue,
          multiValueRemove: () => styles.multiValueRemove,
          menu: () => '!hidden',
          input: () => styles.input,
          indicatorsContainer: () => '!hidden',
          indicatorSeparator: () => '!hidden',
        }}
      />
    </div>
  )
}

export { MultiSelect }
