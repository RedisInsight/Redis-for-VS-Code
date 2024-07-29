import React from 'react'

import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'
import { MonacoLanguage } from 'uiSrc/constants'

export const MonacoJson = (props: CommonProps) => (
  <MonacoEditor
    {...props}
    language={MonacoLanguage.Json}
    className="json-monaco-editor"
  />
)
