import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  KeyTypes,
  KeyValueFormat,
  TEXT_DISABLED_STRING_FORMATTING,
} from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent, isFullStringLoaded } from 'uiSrc/utils'
import { useStringStore } from 'uiSrc/modules/key-details/components/string-details'
import { useContextApi, useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { Select, SelectOption } from 'uiSrc/ui'
import { getKeyValueFormatterOptions } from './constants'
import styles from './styles.module.scss'

export interface Props {
  width: number
}

export const KeyDetailsHeaderFormatter = (props: Props) => {
  const { width } = props

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const keyValue = useStringStore(useShallow((state) => state.data.value))

  const viewFormat = useContextInContext((state) => state.browser.viewFormat)

  const { keyType, length } = useSelectedKeyStore(useShallow((state) => ({
    length: state.data?.length,
    keyType: state.data?.type,
  })))

  const [typeSelected, setTypeSelected] = useState<KeyValueFormat>(viewFormat)
  const [options, setOptions] = useState<SelectOption[]>([])

  const { setViewFormat } = useContextApi()

  const isStringFormattingEnabled = keyType === KeyTypes.String
    ? isFullStringLoaded(keyValue?.data?.length, length)
    : true

  useEffect(() => {
    const newOptions: SelectOption[] = getKeyValueFormatterOptions(keyType).map(
      ({ value, text }) => ({
        value,
        label: <div className={styles.optionText}>{text}</div>,
        testid: `format-option-${value}`,
      }),
    )

    setOptions(newOptions)
  }, [viewFormat, keyType, width, isStringFormattingEnabled])

  const onChangeType = (value: KeyValueFormat) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_DETAILS_FORMATTER_CHANGED,
      eventData: {
        keyType,
        databaseId,
        fromFormatter: viewFormat,
        toFormatter: value,
      },
    })

    setTypeSelected(value)
    setViewFormat(value)
  }

  if (!options.length) {
    return null
  }

  return (
    <div className={cx(styles.container)}>
      <Select
        disabled={!isStringFormattingEnabled}
        options={options}
        idSelected={typeSelected}
        containerClassName={styles.select}
        itemClassName={styles.option}
        onChange={(value: string) => onChangeType(value as KeyValueFormat)}
        title={!isStringFormattingEnabled ? TEXT_DISABLED_STRING_FORMATTING : typeSelected}
        testid="select-format-key-value"
      />
    </div>
  )
}
