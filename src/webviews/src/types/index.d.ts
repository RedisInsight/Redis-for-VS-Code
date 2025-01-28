import { Environment } from 'monaco-editor/esm/vs/editor/editor.api'
import { IVSCodeApi, Nullable, RedisString } from 'uiSrc/interfaces'
import { Database } from 'uiSrc/store'
import { OAuthSocialAction } from 'uiSrc/constants'
import { AppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/interface'

declare global {
  interface Window {
    ri: IRI
    acquireVsCodeApi: () => IVSCodeApi
    MonacoEnvironment: Environment
  }
}

interface IRI {
  cliDatabase?: Database
  database?: Database
  keyInfo?: {
    key?: RedisString
  }
  appPort?: string
  appInfo: Nullable<Partial<AppInfoStore>>
  ssoFlow?: OAuthSocialAction
}
