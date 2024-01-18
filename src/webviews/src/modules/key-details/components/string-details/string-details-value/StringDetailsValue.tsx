import React, {
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
} from 'uiSrc/utils'
import {
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_FAILED_CONVENT_FORMATTER,
  // AddStringFormConfig as config,
} from 'uiSrc/constants'
// import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'

import { useSelectedKeyStore } from 'uiSrc/store'
import { IFetchKeyArgs, RedisString } from 'uiSrc/interfaces'
import { fetchDownloadStringValue, useStringStore } from '../hooks/useStringStore'
import { calculateTextareaLines } from '../utils/calculateTextareaLines'
import { useStringSelector } from '../utils/useStringSelector'
import { APPROXIMATE_WIDTH_OF_SIGN, MAX_LENGTH, MAX_ROWS, MIN_ROWS } from '../constants/string'
import styles from './styles.module.scss'

export interface Props {
  isEditItem: boolean
  setIsEdit: (isEdit: boolean) => void
  onRefresh: (key?: RedisString, args?: IFetchKeyArgs) => void
  onUpdated: () => void
  onDownloaded: () => void
  onLoadAll?: () => void
}

const StringDetailsValue = (props: Props) => {
  const compressor = null
  const { isEditItem, setIsEdit, onRefresh, onDownloaded, onLoadAll, onUpdated } = props

  const {
    loading,
    initialValue,
    resetStringStore,
    setIsStringCompressed,
  } = useStringStore(useShallow(useStringSelector))

  const { viewFormatProp, key, length } = useSelectedKeyStore(useShallow((state) => ({
    viewFormatProp: state.viewFormat,
    key: state.data?.name,
    length: state.data?.length ?? 0,
  })))

  const [rows, setRows] = useState<number>(5)
  const [value, setValue] = useState<JSX.Element | string>('')
  const [areaValue, setAreaValue] = useState<string>('')
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [isValid, setIsValid] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isEditable, setIsEditable] = useState(true)
  const [noEditableText, setNoEditableText] = useState<string>(TEXT_DISABLED_COMPRESSED_VALUE)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)
  const viewValueRef: Ref<HTMLPreElement> = useRef(null)

  // useEffect(() => () => {
  //   resetStringStore()
  // }, [])

  useEffect(() => {
    if (!initialValue) return

    // const { value: decompressedValue, isCompressed } = decompressingBuffer(initialValue, compressor)
    const { value: decompressedValue, isCompressed } = {
      value: initialValue,
      isCompressed: false,
    }

    const initialValueString = bufferToString(decompressedValue, viewFormat)
    const { value: formattedValue, isValid } = formattingBuffer(decompressedValue, viewFormatProp, { expanded: true })
    setAreaValue(initialValueString)

    setValue(!isFullStringLoaded(initialValue?.data?.length, length) ? `${formattedValue}...` : formattedValue)
    setIsValid(isValid)
    setIsDisabled(
      !isNonUnicodeFormatter(viewFormatProp, isValid)
        && !isEqualBuffers(initialValue, stringToBuffer(initialValueString)),
    )
    setIsEditable(
      !isCompressed
      && isFormatEditable(viewFormatProp)
      && isFullStringLoaded(initialValue?.data?.length, length),
    )
    setNoEditableText(isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp))

    setIsStringCompressed(isCompressed)

    if (viewFormat !== viewFormatProp) {
      setViewFormat(viewFormatProp)
    }
  }, [initialValue, viewFormatProp, compressor, length])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current || value === null) {
      return
    }
    const calculatedRows = calculateTextareaLines(areaValue, textAreaRef.current.clientWidth, APPROXIMATE_WIDTH_OF_SIGN)

    if (calculatedRows > MAX_ROWS) {
      setRows(MAX_ROWS)
      return
    }
    if (calculatedRows < MIN_ROWS) {
      setRows(MIN_ROWS)
      return
    }
    setRows(calculatedRows)
  }, [viewValueRef, isEditItem])

  useMemo(() => {
    if (isEditItem && initialValue) {
      (document.activeElement as HTMLElement)?.blur()
      // setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    }
  }, [isEditItem])

  // const onApplyChanges = () => {
  //   const data = stringToSerializedBufferFormat(viewFormat, areaValue)
  //   const onSuccess = () => {
  //     setIsEdit(false)
  //     setValue(formattingBuffer(data, viewFormat, { expanded: true })?.value)
  //     onUpdated()
  //   }
  //   updateStringValueAction(key, data, onSuccess)
  // }

  // const onDeclineChanges = useCallback(() => {
  //   if (!initialValue) return

  //   setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
  //   setIsEdit(false)
  // }, [initialValue])

  const isLoading = loading || value === null

  const handleLoadAll = (key?: RedisString) => {
    const endString = length - 1
    onRefresh(key, { end: endString })
    onLoadAll?.()
  }

  const handleDownloadString = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // fetchDownloadStringValue(key, downloadFile)
    onDownloaded()
  }

  return (
    <>
      <div className={styles.container} data-testid="string-details">
        {/* {isLoading && (
          <span>loading...</span>
        )} */}
        {!isEditItem && (
          <div
            // onMouseUp={() => isEditable && setIsEdit(true)}
            className="whitespace-break-spaces"
            data-testid="string-value"
            role="textbox"
            onKeyDown={() => { }}
            tabIndex={0}
          >
            {areaValue !== ''
              ? (isValid
                ? value
                : (
                  <div
                    title={noEditableText}
                    className={styles.tooltip}
                    data-testid="string-value-tooltip"
                  >
                    {value}
                  </div>
                )
              )
              : (!isLoading && (<span style={{ fontStyle: 'italic' }}>{l10n.t('Empty')}</span>))}
          </div>
        )}
        {/* {isEditItem && (
          <InlineItemEditor
            controlsPosition="bottom"
            placeholder="Enter Value"
            fieldName="value"
            expandable
            isLoading={false}
            isDisabled={isDisabled}
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
              fullWidth
              name="value"
              id="value"
              rows={rows}
              resize="vertical"
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
          </InlineItemEditor>
        )} */}
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
            {/* <div>
              <VSCodeButton
                appearance="secondary"
                disabled={loading}
                className={styles.stringFooterBtn}
                data-testid="download-all-value-btn"
                // onClick={handleDownloadString}
              >
                {l10n.t('Download')}
              </VSCodeButton>
            </div> */}
          </div>
        </div>
      )}
    </>
  )
}

export { StringDetailsValue }
