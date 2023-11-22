import { Dispatch, useState } from 'react'
import { VscodeState } from 'uiSrc/constants'
import { vscodeApi } from 'uiSrc/services'

/**
 * Returns a stateful value, and a function to update it.
 * Serializes the state to the VSCode API.
 *
 * @export
 * @template S
 * @param {(S | (() => S))} initialState The initial state.
 * @param {*} uniqueStateKey A unique key to identify the state.
 * @return {*}  {[S, Dispatch<S>]}
 */
export function useVSCodeState<S>(
  uniqueStateKey: VscodeState,
  initialState: S | (() => S),
): [S, Dispatch<S>] {
  const [localState, setLocalState] = useState(
    vscodeApi.getState()[uniqueStateKey] || initialState,
  )

  const setState = (newState: S) => {
    vscodeApi.setState({ ...vscodeApi.getState(), [uniqueStateKey]: newState })
    setLocalState(newState)
  }
  return [localState, setState]
}
