import { create } from 'zustand'
import { AxiosError } from 'axios'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { isString, uniqBy } from 'lodash'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, ICommand, ICommands } from 'uiSrc/constants'
import { getApiErrorMessage, showErrorMessage } from 'uiSrc/utils'
import { checkDeprecatedCommandGroup } from 'uiSrc/modules/cli/utils'
import {
  RedisCommandsStore,
  RedisCommandsActions,
} from './interface'

export const initialRedisCommandsState: RedisCommandsStore = {
  loading: false,
  spec: {},
  commandsArray: [],
  commandGroups: [],
}

export const useRedisCommandsStore = create<RedisCommandsStore & RedisCommandsActions>()(
  immer(devtools(persist((set) => ({
    ...initialRedisCommandsState,
    // actions
    processRedisCommands: () => set({ loading: true }),
    processRedisCommandsFinal: () => set({ loading: false }),
    processRedisCommandsSuccess: (spec) =>
      set({
        spec,
        commandsArray: Object.keys(spec).sort(),
        commandGroups: uniqBy(Object.values(spec), 'group')
          .map((item: ICommand) => item.group)
          .filter((group: string) => isString(group))
          .filter((group: string) => !checkDeprecatedCommandGroup(group)),
      }),
  }),
  { name: 'redisCommands' }))),
)

// Asynchronous thunk action
export const fetchRedisCommands = () => {
  useRedisCommandsStore.setState(async (state) => {
    state.processRedisCommands()
    try {
      const { data } = await apiService.get<ICommands>(ApiEndpoints.REDIS_COMMANDS)

      state.processRedisCommandsSuccess(data)
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as AxiosError))
    } finally {
      state.processRedisCommandsFinal()
    }
  })
}
