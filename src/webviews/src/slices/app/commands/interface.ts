import { ICommands } from 'uiSrc/constants'

export interface StateAppRedisCommands {
  loading: boolean
  error: string
  spec: ICommands
  commandsArray: string[]
  commandGroups: string[]
}
