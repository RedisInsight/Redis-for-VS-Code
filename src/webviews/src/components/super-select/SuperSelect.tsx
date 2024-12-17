import React, { FC } from 'react'
import cx from 'classnames'
import Select, { Props as SelectProps } from 'react-select'

import { Maybe } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface SuperSelectOption {
  value: string
  label: string
  testid?: string
}

export interface Props extends SelectProps<SuperSelectOption, false> {
  selectedOption?: Maybe<SuperSelectOption>
  containerClassName?: string
  itemClassName?: string
  testid?: string
}

const SuperSelect: FC<Props> = (props) => {
  const {
    selectedOption,
    containerClassName,
    testid,
  } = props

  return (
    <div className={cx(styles.container, containerClassName)} data-testid={testid}>
      <Select<SuperSelectOption>
        {...props}
        closeMenuOnSelect
        closeMenuOnScroll
        isSearchable={false}
        isMulti={false}
        value={selectedOption}
        classNames={{
          container: () => styles.selectContainer,
          control: () => styles.control,
          option: ({ isSelected }) => cx(styles.option, { [styles.optionSelected]: isSelected }),
          singleValue: () => styles.singleValue,
          menu: () => styles.menu,
          indicatorsContainer: () => styles.indicatorsContainer,
          indicatorSeparator: () => 'hidden',
        }}
      />
    </div>
  )
}

export { SuperSelect }
