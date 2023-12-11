import React, { ChangeEvent, useState, useEffect, useRef } from 'react'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscError, VscSearch } from 'react-icons/vsc'

import { Maybe } from 'uiSrc/interfaces'
import { Keys } from 'uiSrc/constants'
import { InputText } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  isOpen: boolean;
  appliedValue: string;
  initialValue?: string;
  handleOpenState: (isOpen: boolean) => void;
  fieldName: string;
  onApply?: (value: string) => void;
  searchValidation?: Maybe<(value: string) => string>;
}

const TableColumnSearchTrigger = (props: Props) => {
  const {
    isOpen,
    handleOpenState,
    fieldName,
    appliedValue,
    initialValue = '',
    onApply = () => { },
    searchValidation,
  } = props
  const [value, setValue] = useState<string>(initialValue)

  const inputEl = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !!inputEl.current) {
      inputEl.current?.focus()
    }
  }, [isOpen])

  const handleChangeValue = (initValue: string) => {
    const value = searchValidation ? searchValidation(initValue) : initValue
    setValue(value)
  }

  const handleOpen = () => {
    handleOpenState(true)
  }

  const handleClose = () => {
    handleOpenState(false)
    setValue('')
  }

  const handleOnBlur = (e?: React.FocusEvent<HTMLInputElement>) => {
    // const relatedTarget = e?.relatedTarget as HTMLInputElement
    const target = e?.target as HTMLInputElement
    if (!target.value) {
      handleClose()
    }
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
    <div style={{ paddingRight: 10 }}>
      <VSCodeButton
        appearance="icon"
        onClick={handleOpen}
        aria-label={`Search ${fieldName}`}
        data-testid="search-button"
      >
        <VscSearch />
      </VSCodeButton>
      <div
        className={cx(styles.search)}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <InputText
          autoFocus
          onKeyDown={onKeyDown}
          onBlur={handleOnBlur}
          inputRef={inputEl}
          name={fieldName}
          // prepend={prependSearchName}
          placeholder="Search"
          value={value || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChangeValue(e.target.value)}
          data-testid="search"
        />
        <VSCodeButton
          appearance="icon"
          onClick={() => setValue('')}
          aria-label={`Decline search ${fieldName}`}
          data-testid="decline-search-button"
          className={styles.declineBtn}
        >
          <VscError />
        </VSCodeButton>
      </div>
    </div>
  )
}

export { TableColumnSearchTrigger }
