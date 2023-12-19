import { DEFAULT_ERROR_MESSAGE, VscodeMessageAction } from 'uiSrc/constants'
import { vscodeApi } from 'uiSrc/services'

export const showErrorMessage = (message = DEFAULT_ERROR_MESSAGE) => {
  vscodeApi.postMessage({ action: VscodeMessageAction.ErrorMessage, data: message })
}

export const showInformationMessage = (message = DEFAULT_ERROR_MESSAGE) => {
  vscodeApi.postMessage({ action: VscodeMessageAction.InformationMessage, data: message })
}
