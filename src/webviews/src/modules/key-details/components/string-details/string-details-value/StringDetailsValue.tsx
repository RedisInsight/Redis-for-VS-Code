import React, {
  ChangeEvent,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { useShallow } from 'zustand/react/shallow'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import {
  bufferToSerializedFormat,
  bufferToString,
  formattingBuffer,
  isNonUnicodeFormatter,
  isEqualBuffers,
  isFormatEditable,
  stringToBuffer,
  isFullStringLoaded,
  stringToSerializedBufferFormat,
  decompressingBuffer,
} from 'uiSrc/utils'
import {
  KeyValueFormat,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
  AddStringFormConfig as config,
} from 'uiSrc/constants'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'

import { useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { IFetchKeyArgs, RedisString } from 'uiSrc/interfaces'
import { TextArea, Tooltip } from 'uiSrc/ui'
import { InlineEditor } from 'uiSrc/components'
import { fetchDownloadStringValue, updateStringValueAction, useStringStore } from '../hooks/useStringStore'
import { useStringSelector } from '../utils/useStringSelector'
import { MAX_LENGTH } from '../constants/string'
import styles from './styles.module.scss'

export interface Props {
  isEditItem: boolean
  setIsEdit: (isEdit: boolean) => void
  onRefresh: (key?: RedisString, args?: IFetchKeyArgs) => void
  onUpdated: () => void
  onDownloaded?: () => void
  onLoadAll?: () => void
}

const StringDetailsValue = (props: Props) => {
  const { isEditItem, setIsEdit, onRefresh, onDownloaded, onLoadAll, onUpdated } = props

  const {
    loading,
    initialValue,
    setIsStringCompressed,
  } = useStringStore(useShallow(useStringSelector))

  const compressor = useDatabasesStore((state) => state.connectedDatabase?.compressor ?? null)

  const viewFormatProp = useContextInContext((state) => state.browser.viewFormat)

  const { key, length } = useSelectedKeyStore(useShallow((state) => ({
    key: state.data?.name,
    length: state.data?.length ?? 0,
  })))

  const [value, setValue] = useState<JSX.Element | string>('')
  const [areaValue, setAreaValue] = useState<string>('')
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [isValid, setIsValid] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isEditable, setIsEditable] = useState(true)
  const [noEditableText, setNoEditableText] = useState<string>(TEXT_DISABLED_COMPRESSED_VALUE)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  useEffect(() => {
    setIsEdit?.(false)
  }, [key])

  useEffect(() => {
    if (!initialValue) return

    const { value: decompressedValue, isCompressed } = decompressingBuffer(initialValue, compressor)

    const initialValueString = bufferToString(decompressedValue, viewFormat)
    const fullStringLoaded = isFullStringLoaded(initialValue?.data?.length, length)
    const { value: formattedValue, isValid } = formattingBuffer(
      decompressedValue,
      fullStringLoaded ? viewFormatProp : KeyValueFormat.Unicode,
      { expanded: true },
    )
    setAreaValue(initialValueString)

    setValue(!fullStringLoaded ? `${formattedValue}...` : formattedValue)
    setIsValid(isValid)
    setIsDisabled(
      !isNonUnicodeFormatter(viewFormatProp, isValid)
        && !isEqualBuffers(initialValue, stringToBuffer(initialValueString)),
    )
    setIsEditable(
      !isCompressed
      && isFormatEditable(viewFormatProp)
      && fullStringLoaded,
    )
    setNoEditableText(isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp))

    setIsStringCompressed(isCompressed)

    if (viewFormat !== viewFormatProp) {
      setViewFormat(viewFormatProp)
    }
  }, [initialValue, viewFormatProp, compressor, length])

  useMemo(() => {
    if (isEditItem && initialValue) {
      (document.activeElement as HTMLElement)?.blur()
      setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    }
  }, [isEditItem])

  const onApplyChanges = () => {
    const data = stringToSerializedBufferFormat(viewFormat, areaValue)
    const onSuccess = () => {
      setIsEdit(false)
      setValue(formattingBuffer(data, viewFormat, { expanded: true })?.value)
      onUpdated()
    }
    updateStringValueAction(key, data, onSuccess)
  }

  const onDeclineChanges = useCallback(() => {
    if (!initialValue) return

    setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    setIsEdit(false)
  }, [initialValue])

  const isLoading = loading || value === null

  const handleLoadAll = (key?: RedisString) => {
    const endString = length - 1
    onRefresh(key, { end: endString })
    onLoadAll?.()
  }

  const handleDownloadString = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    fetchDownloadStringValue(key, downloadFile)
    onDownloaded?.()
  }

  return (
    <>
      <div className={styles.container} data-testid="string-details">
        {!isEditItem && (
          <div
            className="whitespace-break-spaces"
            data-testid="string-value"
            role="textbox"
            onKeyDown={() => { }}
            tabIndex={0}
            onMouseUp={() => isEditable && setIsEdit(true)}
          >
            {areaValue !== ''
              ? (isValid
                ? value
                : (
                  <Tooltip
                    content={noEditableText}
                    mouseEnterDelay={500}
                    className={styles.tooltip}
                    data-testid="string-value-tooltip"
                  >
                    {value}
                  </Tooltip>
                )
              )
              : (!isLoading && (<span className="italic">{l10n.t('Empty')}</span>))}
          </div>
        )}
        {isEditItem && (
          <InlineEditor
            expandable
            active
            controlsPosition="bottom"
            placeholder={l10n.t('Enter Value')}
            fieldName="value"
            preventOutsideClick
            loading={false}
            disabled={isDisabled}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={onDeclineChanges}
            onApply={onApplyChanges}
            declineOnUnmount={false}
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={() =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, areaValue),
                viewFormat,
              )?.isValid}
          >
            <TextArea
              autoFocus
              name="value"
              id="value"
              placeholder={config.value.placeholder}
              value={areaValue}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setAreaValue(e.target.value)
              }}
              disabled={loading}
              inputRef={textAreaRef}
              className={cx(styles.stringTextArea, { [styles.areaWarning]: isDisabled })}
              data-testid="string-value"
            />
          </InlineEditor>
        )}
        {isLoading && (
          <span>{l10n.t('loading...')}</span>
        )}
      </div>

      {length > MAX_LENGTH && (
        <div className="key-details-footer" key="key-details-footer">
          <div className="flex items-center justify-between">
            <div>
              {!isFullStringLoaded(initialValue?.data?.length, length) && (
                <VSCodeButton
                  appearance="secondary"
                  disabled={loading}
                  data-testid="load-all-value-btn"
                  className={styles.stringFooterBtn}
                  onClick={() => handleLoadAll(key)}
                >
                  {l10n.t('Load all')}
                </VSCodeButton>
              )}
            </div>
            <div>
              <VSCodeButton
                appearance="secondary"
                disabled={loading}
                className={styles.stringFooterBtn}
                data-testid="download-all-value-btn"
                onClick={handleDownloadString}
              >
                {l10n.t('Download')}
              </VSCodeButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { StringDetailsValue }
