import React from 'react'
import ReactContentEditable, { Props } from 'react-contenteditable'
import { parsePastedText } from 'uiSrc/utils/formatters'

const useRefCallback = <T extends any[]>(
  value: ((...args: T) => void) | undefined,
  deps?: React.DependencyList,
): ((...args: T) => void) => {
  const ref = React.useRef(value)

  React.useEffect(() => {
    ref.current = value
  }, deps ?? [value])

  return React.useCallback((...args: T) => {
    ref.current?.(...args)
  }, [])
}

const onPaste = (e: React.ClipboardEvent) => {
  e.preventDefault()

  const clipboardData = e.clipboardData || window.Clipboard || e.originalEvent.clipboardData
  const text = clipboardData.getData('text/plain') as string

  document.execCommand('insertText', false, parsePastedText(text))
}

export function ContentEditable({
  ref,
  onChange,
  onInput,
  onBlur,
  onKeyPress,
  onKeyDown,
  onMouseUp,
  ...props
}: Props) {
  const onChangeRef = useRefCallback(onChange)
  const onInputRef = useRefCallback(onInput)
  const onBlurRef = useRefCallback(onBlur)
  const onKeyPressRef = useRefCallback(onKeyPress)
  const onKeyDownRef = useRefCallback(onKeyDown)
  const onMouseUpRef = useRefCallback(onMouseUp)

  return (
    <ReactContentEditable
      {...props}
      onPaste={onPaste}
      onChange={onChangeRef}
      onInput={onInputRef}
      onBlur={onBlurRef}
      onKeyPress={onKeyPressRef}
      onKeyDown={onKeyDownRef}
      onMouseUp={onMouseUpRef}
    />
  )
}
