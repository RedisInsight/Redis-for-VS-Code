import { SelectedKeyAction } from 'uiSrc/interfaces'
import { useSelectedKeyStore } from 'uiSrc/store'

export const setSelectedKeyAction = (message: SelectedKeyAction) => {
  if (message.data?.keyInfo?.key) {
    useSelectedKeyStore.getState().setSelectedKeyAction(message.data)
  }
}
