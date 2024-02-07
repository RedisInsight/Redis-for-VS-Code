import { forwardRef, useImperativeHandle } from 'react'
import { useSelector } from 'react-redux'

import { DEFAULT_TREE_SORTING } from 'uiSrc/constants'
import { appContextDbConfig } from 'uiSrc/slices/app/context/context.slice'
import { Database } from 'uiSrc/store'
import { useKeysApi } from '../../hooks/useKeys'

export interface Props {
  database: Database
}

export interface KeysHandle {
  handleKeys: () => void
}

export const DatabaseImperative = forwardRef<KeysHandle, Props>(({ database }, ref) => {
  const { id, name } = database
  const { treeViewSort: sorting = DEFAULT_TREE_SORTING } = useSelector(appContextDbConfig)

  const keysApi = useKeysApi()

  useImperativeHandle(ref, () => ({
    handleKeys() {
      console.debug('useImperativeHandle', id)
    },
  }))
  return null
})
