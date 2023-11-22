import { StringActions, StringState } from '../hooks/interface'

export const useStringSelector = (state: StringState & StringActions) => ({
  loading: state.loading,
  keyValue: state.data.value,
  isStringCompressed: state.isCompressed,
  initialValue: state.data?.value,
  resetStringStore: state.resetStringStore,
  setIsStringCompressed: state.setIsStringCompressed,
})
