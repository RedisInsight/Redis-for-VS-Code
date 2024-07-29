import { useEffect } from 'react'
import { monaco } from 'react-monaco-editor'
import { findIndex } from 'lodash'

import { MonacoLanguage } from 'uiSrc/constants'
import { jsonLanguageConfig } from './json/jsonLanguageConfig'
import { createTokenizationSupport } from './json/jsonMonarchTokensProvider'

export const MonacoLanguages = () => {
  useEffect(() => {
    setupMonacoJsonLang()
  }, [])

  const setupMonacoJsonLang = () => {
    const languages = monaco.languages.getLanguages()
    const isJsonLangRegistered = findIndex(languages, { id: MonacoLanguage.Json }) > -1
    if (!isJsonLangRegistered) {
      monaco.languages.register({ id: MonacoLanguage.Json })
    }

    monaco.languages.setLanguageConfiguration(MonacoLanguage.Json, jsonLanguageConfig)

    monaco.languages.setTokensProvider(MonacoLanguage.Json, createTokenizationSupport(true))
  }

  return null
}
