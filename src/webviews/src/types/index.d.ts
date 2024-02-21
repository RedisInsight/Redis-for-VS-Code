import { IVSCodeApi } from 'uiSrc/interfaces'

declare global {
  interface Window {
    apiPort?: string
    acquireVsCodeApi: () => IVSCodeApi
  }
}
