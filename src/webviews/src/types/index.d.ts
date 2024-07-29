import { Environment } from 'monaco-editor/esm/vs/editor/editor.api'
import { IVSCodeApi, Nullable } from 'uiSrc/interfaces'
import { AppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/interface'

declare global {
  interface Window {
    appPort?: string
    appInfo: Nullable<Partial<AppInfoStore>>
    acquireVsCodeApi: () => IVSCodeApi
    MonacoEnvironment: Environment
  }
}
