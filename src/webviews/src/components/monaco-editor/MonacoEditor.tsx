import React, { useEffect, useRef } from 'react'
import ReactMonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import cx from 'classnames'
import { merge } from 'lodash'

import { Nullable } from 'uiSrc/interfaces'
import { IEditorMount, ISnippetController } from './interfaces'

export interface CommonProps {
  value: string
  onChange?: (value: string) => void
  onApply?: (
    event: React.MouseEvent,
  ) => void
  onDecline?: (event?: React.MouseEvent<HTMLElement>) => void
  disabled?: boolean
  wrapperClassName?: string
  options?: monacoEditor.editor.IStandaloneEditorConstructionOptions
  'data-testid'?: string
}

export interface Props extends CommonProps {
  onEditorDidMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => void
  onEditorWillMount?: (monaco: typeof monacoEditor) => void
  className?: string
  language: string
}
export const MonacoEditor = (props: Props) => {
  const {
    value,
    onChange,
    onApply,
    onDecline,
    onEditorDidMount,
    onEditorWillMount,
    disabled,
    language,
    wrapperClassName,
    className,
    options = {},
    'data-testid': dataTestId = 'monaco-editor',
  } = props

  let contribution: Nullable<ISnippetController> = null
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)
  const input = useRef<HTMLDivElement>(null)

  useEffect(() =>
  // componentWillUnmount
    () => {
      contribution?.dispose?.()
    },
  [])

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = { editor, monaco }

    // hack for exit from snippet mode after click Enter until no answer from monaco authors
    // https://github.com/microsoft/monaco-editor/issues/2756
    contribution = editor.getContribution<ISnippetController>('snippetController2')

    editor.onKeyDown(onKeyDownMonaco)

    onEditorDidMount?.(editor, monaco)
  }

  const editorWillMount = (monaco: typeof monacoEditor) => {
    onEditorWillMount?.(monaco)
  }

  const onKeyDownMonaco = (e: monacoEditor.IKeyboardEvent) => {
    // trigger parameter hints
    if (e.keyCode === monacoEditor.KeyCode.Enter || e.keyCode === monacoEditor.KeyCode.Space) {
      onExitSnippetMode()
    }
  }

  const onExitSnippetMode = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    if (contribution?.isInSnippet?.()) {
      const { lineNumber = 0, column = 0 } = editor?.getPosition() ?? {}
      editor.setSelection(new monacoEditor.Selection(lineNumber, column, lineNumber, column))
      contribution?.cancel?.()
    }
  }

  const monacoOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = merge({
    language,
    wordWrap: 'on',
    automaticLayout: true,
    formatOnPaste: false,
    padding: { top: 10 },
    suggest: {
      preview: false,
      showStatusBar: false,
      showIcons: false,
      showProperties: false,
    },
    quickSuggestions: false,
    minimap: {
      enabled: false,
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    lineNumbersMinChars: 4,
  }, options)

  return (
    <div className={cx(wrapperClassName, { disabled })}>
      <ReactMonacoEditor
        theme="vs-dark"
        language={language}
        value={value ?? ''}
        onChange={onChange}
        options={monacoOptions}
        className={cx(className)}
        editorDidMount={editorDidMount}
        editorWillMount={editorWillMount}
        data-testid={dataTestId}
      />
    </div>
  )
}

export default MonacoEditor
