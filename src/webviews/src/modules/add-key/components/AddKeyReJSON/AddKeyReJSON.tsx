import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import Popup from 'reactjs-popup'

import { MonacoJson } from 'uiSrc/components/monaco-editor'
import {
  getRequiredFieldsText,
  isContainJSONModule,
  sendEventTelemetry,
  stringToBuffer,
  TelemetryEvent,
} from 'uiSrc/utils'
import { Maybe } from 'uiSrc/interfaces'
import {
  useKeysApi,
  useKeysInContext,
} from 'uiSrc/modules/keys-tree/hooks/useKeys'
import {
  AddJSONFormConfig as config,
  helpTexts,
  KeyTypes,
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/constants'
import { CreateRejsonRlWithExpireDto } from 'uiSrc/modules/keys-tree/hooks/interface'
import { useDatabasesStore, useOAuthStore } from 'uiSrc/store'
import { UploadFile } from 'uiSrc/components'
import { JSONErrors } from 'uiSrc/modules/key-details/components/rejson-details/constants'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

export const AddKeyReJSON = (props: Props) => {
  const { setSSOFlow, setSocialDialogState } = useOAuthStore((state) => ({
    setSSOFlow: state.setSSOFlow,
    setSocialDialogState: state.setSocialDialogState,
  }))

  const { keyName = '', keyTTL, onClose } = props
  const loading = useKeysInContext((state) => state.addKeyLoading)
  const modules = useDatabasesStore((state) => state.connectedDatabase?.modules)
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)
  const isJsonLoaded = isContainJSONModule(modules!!)

  const [ReJSONValue, setReJSONValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const keysApi = useKeysApi()

  useEffect(() => {
    try {
      JSON.parse(ReJSONValue)
      if (keyName.length > 0) {
        setIsFormValid(true)
        return
      }
    } catch (e) {
      setIsFormValid(false)
    }

    setIsFormValid(false)
  }, [keyName, ReJSONValue])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateRejsonRlWithExpireDto = {
      keyName: stringToBuffer(keyName),
      data: ReJSONValue,
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    keysApi.addReJSONKey(data, () => onClose(false, KeyTypes.ReJSON))
  }

  const handleImportClick = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_JSON_VALUE_IMPORT_CLICKED,
      eventData: {
        databaseId,
      },
    })
  }, [databaseId])

  const onFreeTrialDbClick = () => {
    const source = OAuthSocialSource.BrowserRedisJSON
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: { source },
    })

    setSSOFlow(OAuthSocialAction.Create)
    setSocialDialogState(source)
  }

  const SubmitBtn = () => (
    <VSCodeButton
      onClick={submitData}
      disabled={!isFormValid || loading}
      data-testid="btn-add"
    >
      {l10n.t('Add Key')}
    </VSCodeButton>
  )

  const disabledSubmitText = getRequiredFieldsText({
    keyName: !keyName && l10n.t('Key Name'),
    ReJSONValue: !ReJSONValue && l10n.t('Value'),
    validJson: ReJSONValue && !isFormValid && JSONErrors.valueJSONFormat,
  })

  return (
    <form onSubmit={onFormSubmit}>
      {!isJsonLoaded && (
        <span className="block pb-3" data-testid="json-not-loaded-text">
          {helpTexts.REJSON_SHOULD_BE_LOADED(onFreeTrialDbClick)}
        </span>
      )}
      <>
        <div className="pb-2 font-bold uppercase">{config.value.label}</div>
        <MonacoJson
          value={ReJSONValue}
          onChange={setReJSONValue}
          wrapperClassName={
            !isJsonLoaded ? 'h-[calc(100vh-340px)]' : 'h-[calc(100vh-300px)]'
          }
          disabled={loading}
          data-testid="json-value"
        />
        <div className="flex justify-end">
          <div className="">
            <UploadFile
              onClick={handleImportClick}
              onFileChange={setReJSONValue}
              accept="application/json, text/plain"
            />
          </div>
        </div>
      </>

      <div className="flex justify-end mt-5">
        {disabledSubmitText && (
          <Popup
            keepTooltipInside
            on="hover"
            position="top center"
            trigger={SubmitBtn}
          >
            <div className="font-bold pb-1">{disabledSubmitText}</div>
          </Popup>
        )}
        {!disabledSubmitText && <SubmitBtn />}
      </div>
    </form>
  )
}
