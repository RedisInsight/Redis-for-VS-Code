import { toNumber, omit } from 'lodash'
import React, { useEffect, useState } from 'react'

import {
  removeEmpty,
  getFormUpdates,
  getDiffKeysOfObjectValues,
  sendEventTelemetry,
  TelemetryEvent,
  applyTlSDatabase,
  applySSHDatabase,
  autoFillFormDetails,
  getTlsSettings,
  getFormValues,
} from 'uiSrc/utils'
import { DatabaseType, DbConnectionInfo, Nullable } from 'uiSrc/interfaces'
import { ConnectionType, DbType,
  DEFAULT_TIMEOUT,
  SubmitBtnText,
  VscodeMessageAction,
} from 'uiSrc/constants'
import { Database, createDatabaseStandalone, updateDatabase, useDatabasesStore } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'
import { ManualConnectionForm } from './manual-connection-form'

export interface Props {
  editMode?: boolean
  initialValues?: Nullable<Record<string, any>>
  editedDatabase?: Nullable<Database>
  onClose?: () => void
  onAliasEdited?: (value: string) => void
}

const ManualConnection = (props: Props) => {
  const {
    editMode,
    onClose,
    onAliasEdited,
    editedDatabase,
    initialValues: initialValuesProp,
  } = props
  const [formFields, setFormFields] = useState(getFormValues(editedDatabase || initialValuesProp))

  const [isCloneMode, setIsCloneMode] = useState<boolean>(false)

  const loadingStandalone = useDatabasesStore((state) => state.loading)

  const connectionType = editedDatabase?.connectionType ?? DbType.STANDALONE

  useEffect(() => {
    setFormFields(getFormValues(editedDatabase || initialValuesProp))
    setIsCloneMode(false)
  }, [editedDatabase, initialValuesProp])

  const onMastersSentinelFetched = () => {
    // history.push(Pages.sentinelDatabases)
  }

  const handleAddDatabase = (payload: any) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MANUALLY_SUBMITTED,
    })

    createDatabaseStandalone(payload, onMastersSentinelFetched, onDbAdded)
  }

  const onDbAdded = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.CloseAddDatabase })
  }

  const onDbEdited = (database: Database) => {
    vscodeApi.postMessage({
      action: VscodeMessageAction.CloseEditDatabase,
      data: { database },
    })
  }

  const handleEditDatabase = (payload: any) => {
    updateDatabase(payload, onDbEdited)
  }

  const handleCloneDatabase = (payload: any) => {
    // dispatch(cloneDatabaseAction(payload))
  }

  const handleTestConnectionDatabase = (values: DbConnectionInfo) => {
    // sendEventTelemetry({
    //   event: TelemetryEvent.CONFIG_DATABASES_TEST_CONNECTION_CLICKED,
    // })
    // const payload = preparePayload(values)

    // dispatch(testDatabaseStandaloneAction(payload))
  }

  const handleConnectionFormSubmit = (values: DbConnectionInfo) => {
    if (isCloneMode) {
      const diffKeys = getDiffKeysOfObjectValues(formFields, values)
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CONFIRMED,
        eventData: {
          fieldsModified: diffKeys,
        },
      })
    }
    const payload = preparePayload(values)

    if (isCloneMode) {
      handleCloneDatabase(payload)
      return
    }
    if (editMode) {
      handleEditDatabase(payload)
      return
    }

    handleAddDatabase(payload)
  }

  const preparePayload = (values: any) => {
    const tlsSettings = getTlsSettings(values)

    const {
      name,
      host,
      port,
      db,
      username,
      password,
      timeout,
      compressor,
      sentinelMasterName,
      sentinelMasterUsername,
      sentinelMasterPassword,
    } = values

    const database: any = {
      id: editedDatabase?.id,
      name,
      host,
      port: +port,
      db: +(db || 0),
      username,
      password,
      compressor,
      timeout: timeout ? toNumber(timeout) * 1_000 : toNumber(DEFAULT_TIMEOUT),
    }

    // add tls & ssh for database (modifies database object)
    applyTlSDatabase(database, tlsSettings)
    applySSHDatabase(database, values)

    if (connectionType === ConnectionType.Sentinel) {
      database.sentinelMaster = {
        name: sentinelMasterName,
        username: sentinelMasterUsername,
        password: sentinelMasterPassword,
      }
    }

    if (editMode) {
      database.id = editedDatabase?.id

      return getFormUpdates(database, omit(editedDatabase, ['id']))
    }

    return removeEmpty(database)
  }

  const handleOnClose = () => {
    if (isCloneMode) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
        eventData: {
          databaseId: editedDatabase?.id,
        },
      })
    }
    onClose?.()
  }

  const getSubmitButtonText = () => {
    if (isCloneMode) {
      return SubmitBtnText.CloneDatabase
    }
    if (editMode) {
      return SubmitBtnText.EditDatabase
    }
    return SubmitBtnText.AddDatabase
  }

  const handlePostHostName = (content: string): boolean => (
    autoFillFormDetails(content, formFields, setFormFields, DatabaseType.Standalone)
  )

  return (
    <div>
      <ManualConnectionForm
        formFields={formFields}
        // connectionType={connectionType}
        loading={loadingStandalone}
        submitButtonText={getSubmitButtonText()}
        onSubmit={handleConnectionFormSubmit}
        // onTestConnection={handleTestConnectionDatabase}
        onClose={handleOnClose}
        onHostNamePaste={handlePostHostName}
        isEditMode={editMode}
        isCloneMode={isCloneMode}
        setIsCloneMode={setIsCloneMode}
        // onAliasEdited={onAliasEdited}
      />
    </div>
  )
}

export { ManualConnection }
