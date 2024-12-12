import React, { useEffect, useState } from 'react'
import { isUndefined } from 'lodash'
import { useShallow } from 'zustand/react/shallow'

import { sendEventTelemetry, TelemetryEvent, stringToBuffer } from 'uiSrc/utils'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { KeyTypes } from 'uiSrc/constants'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { Spinner } from 'uiSrc/ui'

import { parseJsonData } from './utils'
import { IJSONData } from './interfaces'
import { RejsonDetails } from './rejson-details'
import { useRejsonStore } from './hooks/useRejsonStore'

import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {}

const RejsonDetailsWrapper = (props: Props) => {
  const { updatedData, downloaded, type, path, loading } = useRejsonStore(useShallow((state) => ({
    updatedData: state.data.data,
    type: state.data.type,
    path: state.data.path,
    loading: state.loading,
    downloaded: state.data.downloaded,
  })))

  const { selectedKey, nameString, length } = useSelectedKeyStore(useShallow((state) => ({
    selectedKey: state.data?.name,
    nameString: state.data?.nameString,
    length: state.data?.length,
  })))

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const data = parseJsonData(updatedData)

  useEffect(() => {
    setExpandedRows(new Set())
  }, [nameString])

  const reportJSONKeyCollapsed = (level: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_JSON_KEY_COLLAPSED,
      eventData: {
        databaseId,
        level,
      },
    })
  }

  const reportJSONKeyExpanded = (level: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_JSON_KEY_EXPANDED,
      eventData: {
        databaseId,
        level,
      },
    })
  }

  const handleJsonKeyExpandAndCollapse = (isExpanded: boolean, path: string) => {
    const matchedPath = path.match(/\[.+?\]/g)
    const levelFromPath = matchedPath ? matchedPath.length - 1 : 0

    if (isExpanded) {
      reportJSONKeyExpanded(levelFromPath)
    } else {
      reportJSONKeyCollapsed(levelFromPath)
    }

    setExpandedRows((rows) => {
      const copyOfSet = new Set(rows)
      if (isExpanded) copyOfSet.add(path)
      else copyOfSet.delete(path)

      return copyOfSet
    })
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={KeyTypes.ReJSON}
      />
      <div className="key-details-body" key="key-details-body">
        <div className="flex flex-column h-full overflow-auto">
          <div
            data-testid="json-details"
            className={styles.container}
          >
            {loading && <div className={styles.keySpinner}><Spinner /></div>}

            {!isUndefined(data) && (
              <RejsonDetails
                selectedKey={selectedKey || stringToBuffer('')}
                dataType={type || ''}
                data={data as IJSONData}
                length={length}
                parentPath={path}
                expandedRows={expandedRows}
                onJsonKeyExpandAndCollapse={handleJsonKeyExpandAndCollapse}
                isDownloaded={downloaded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { RejsonDetailsWrapper }
