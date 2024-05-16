import { IVSCodeApi, Nullable } from 'uiSrc/interfaces'
import { AppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/interface'

declare global {
  interface Window {
    appPort?: string
    appInfo: Nullable<Partial<AppInfoStore>>
    acquireVsCodeApi: () => IVSCodeApi
  }
}
