import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'

import { SelectedKeyActionType } from 'uiSrc/constants'
import { Database, useSelectedKeyStore } from 'uiSrc/store'
import { useKeysApi } from '../../hooks/useKeys'

export interface Props {
  database: Database
  dbIndex?: number
  children: React.ReactNode
}

export const LogicalDatabaseWrapper = ({ children, database }: Props) => {
  const { id: dbId, db: dbIndex } = database
  const { selectedKeyAction, setSelectedKeyAction, setSelectedKey } = useSelectedKeyStore(useShallow((state) => ({
    selectedKeyAction: state.action,
    setSelectedKeyAction: state.setSelectedKeyAction,
    setSelectedKey: state.processSelectedKeySuccess,
  })))

  const [renderChildren, setRenderChildren] = useState<boolean>(false)

  const keysApi = useKeysApi()

  useEffect(() => {
    keysApi.setDatabaseId(dbId)
    keysApi.setDatabaseIndex(dbIndex ?? 0)

    setRenderChildren(true)
  }, [])

  useEffect(() => {
    const { type, keyInfo, database: databaseAction } = selectedKeyAction || {}
    const { key, keyType, newKey } = keyInfo || {}
    const { id: databaseId, db: databaseIndex } = databaseAction || {}

    if (!type || (databaseId! + databaseIndex !== dbId + dbIndex)) {
      return
    }

    switch (type) {
      case SelectedKeyActionType.Added:
        keysApi.addKeyIntoTree(key!, keyType!)
        setSelectedKey({ name: key! })
        break
      case SelectedKeyActionType.Removed:
        keysApi.deleteKeyFromTree(key!)
        break
      case SelectedKeyActionType.Renamed:
        keysApi.editKeyName(key!, newKey!)
        break
      default:
        break
    }
    setSelectedKeyAction(null)
  }, [selectedKeyAction])

  return (
    <div
      className={cx('flex w-full flex-col')}
      data-testid={`logical-database-${dbId}-${dbIndex}`}
    >
      {renderChildren && children}
    </div>
  )
}
