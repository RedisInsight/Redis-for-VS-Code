import { useStringStore } from 'uiSrc/modules'
import { useHashStore } from 'uiSrc/modules/key-details/components/hash-details/hooks/useHashStore'
import { useZSetStore } from 'uiSrc/modules/key-details/components/zset-details/hooks/useZSetStore'
import { useSelectedKeyStore } from './hooks/use-selected-key-store/useSelectedKeyStore'

export const resetZustand = () => {
  useSelectedKeyStore.getState().resetSelectedKeyStore()
  useStringStore.getState().resetStringStore()
  useHashStore.getState().resetHashStore()
  useZSetStore.getState().resetZSetStore()
}
