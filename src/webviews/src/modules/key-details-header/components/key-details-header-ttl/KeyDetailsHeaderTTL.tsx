import React, { useEffect, useState } from 'react'

import { useShallow } from 'zustand/react/shallow'
import { RedisResponseBuffer } from 'uiSrc/interfaces'

import { validateTTLNumber } from 'uiSrc/utils'
import { useSelectedKeyStore } from 'uiSrc/store'
import { AddCommonFieldsFormConfig, MAX_TTL_NUMBER } from 'uiSrc/constants'
import { InlineEditor } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  onEditTTL: (key: RedisResponseBuffer, ttl: number) => void
}

const KeyDetailsHeaderTTL = ({ onEditTTL }: Props) => {
  const { ttlProp, keyBuffer, keyProp, loading } = useSelectedKeyStore(useShallow((state) => ({
    ttlProp: state.data?.ttl,
    keyProp: state.data?.nameString,
    keyBuffer: state.data?.name,
    loading: state.loading,
  })))

  const [ttl, setTTL] = useState(`${ttlProp}`)

  useEffect(() => {
    setTTL(`${ttlProp}`)
  }, [keyProp, ttlProp])

  const onChangeTTL = (value: string) => {
    setTTL(validateTTLNumber(value) || '-1')
  }

  const applyEditTTL = () => {
    const ttlValue = ttl || '-1'

    if (`${ttlProp}` !== ttlValue && keyBuffer) {
      onEditTTL(keyBuffer as RedisResponseBuffer, +ttlValue)
    }
  }

  const cancelEditTTl = (event: any) => {
    setTTL(`${ttlProp}`)
    event?.stopPropagation()
  }

  return (
    <div
      className={styles.flexItemTTL}
      data-testid="edit-ttl-btn"
    >
      <div className={styles.ttlGridComponent}>
        <span className={styles.subtitleText}>
          TTL:
        </span>
        <div>
          <InlineEditor
            onApply={() => applyEditTTL()}
            onDecline={(event) => cancelEditTTl(event)}
            isLoading={loading}
            initialValue={ttl === '-1' ? '' : ttl}
            maxLength={MAX_TTL_NUMBER}
            placeholder={AddCommonFieldsFormConfig?.keyTTL?.placeholder}
            validation={(value) => validateTTLNumber(value)}
            onChange={onChangeTTL}
            inlineTestId="edit-ttl-input"
          />
        </div>
      </div>
    </div>
  )
}

export { KeyDetailsHeaderTTL }
