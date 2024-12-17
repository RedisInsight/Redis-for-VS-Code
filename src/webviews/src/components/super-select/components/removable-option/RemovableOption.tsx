import React, { Children, useCallback, useState } from 'react'
import { MenuListProps } from 'react-select'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { PopoverDelete, SuperSelectOption } from 'uiSrc/components'
import { Maybe, RedisString } from 'uiSrc/interfaces'

import styles from '../../styles.module.scss'

export interface Props extends MenuListProps<SuperSelectOption, false> {
  suffix: string
  countDefaultOptions: number
  onDeleteOption: (id: RedisString, onSuccess: () => void) => void
}

const SuperSelectRemovableOption = (props: Props) => {
  const { suffix, countDefaultOptions = 0, options, children, getValue, selectOption, onDeleteOption } = props

  const [activeOptionId, setActiveOptionId] = useState<Maybe<string>>(undefined)

  const showPopover = useCallback((id = '') => {
    setActiveOptionId(`${id}${suffix}`)
  }, [])

  const handleRemoveOption = (id: RedisString) => {
    onDeleteOption(id, () => {
      const selectedValue = getValue()?.[0]
      setActiveOptionId(undefined)

      // reset selected option if removed value is selected
      if (selectedValue?.value === id) {
        selectOption(options?.[0] as SuperSelectOption)
      } else {
        selectOption(selectedValue)
      }
    })
  }

  return (
    <div>
      {Children.map(children, (child, i) => (
        <div key={(options[i] as SuperSelectOption).value} className={cx(styles.option, 'flex justify-between items-center relative')}>
          {child}
          {i + 1 > countDefaultOptions && <PopoverDelete
            header={`${(options[i] as SuperSelectOption).label}`}
            text={l10n.t('will be removed from Redis for VS Code.')}
            item={(options[i] as SuperSelectOption).value}
            suffix={suffix}
            triggerClassName='absolute right-2.5'
            position='right center'
            deleting={activeOptionId}
            showPopover={showPopover}
            handleDeleteItem={handleRemoveOption}
            testid={`delete-option-${(options[i] as SuperSelectOption).value}`}
          />}
        </div>
      ))}
    </div>
  )
}

export { SuperSelectRemovableOption }
