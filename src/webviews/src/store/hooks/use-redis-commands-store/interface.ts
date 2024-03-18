import { ICommands } from 'uiSrc/constants'

export interface RedisCommandsStore {
  loading: boolean
  spec: ICommands
  commandsArray: string[]
  commandGroups: string[]
}

export interface RedisCommandsActions {
  processRedisCommands: () => void
  processRedisCommandsFinal: () => void
  processRedisCommandsSuccess: (commands: ICommands) => void
}
