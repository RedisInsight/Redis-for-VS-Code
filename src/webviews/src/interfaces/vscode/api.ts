import { KeyTypes, SelectedKeyActionType, VscodeMessageAction } from 'uiSrc/constants'
import { Database } from 'uiSrc/store'
import { RedisString } from '../core/app'

export interface IVSCodeApi {
  getState: () => any
  setState: (newState: any) => any
  postMessage: (message: PostMessage) => void
}

export interface SelectKeyAction {
  action: VscodeMessageAction.SelectKey
  data: { key: RedisString, databaseId: string }
}

export interface RefreshTreeAction {
  action: VscodeMessageAction.RefreshTree
  data: { key?: RedisString, type: SelectedKeyActionType, databaseId: string }
}

export interface DatabaseAction {
  action: VscodeMessageAction.EditDatabase | VscodeMessageAction.AddKey | VscodeMessageAction.AddCli | VscodeMessageAction.OpenCli
  data: Database
}

export interface InformationMessageAction {
  action: VscodeMessageAction.InformationMessage | VscodeMessageAction.ErrorMessage
  data: string
}

export interface SelectedKeyAction {
  action: VscodeMessageAction.CloseKeyAndRefresh | VscodeMessageAction.CloseAddKeyAndRefresh | VscodeMessageAction.RefreshTree
  data: { key?: RedisString, type: SelectedKeyActionType, databaseId: string, keyType?: KeyTypes }
}

export interface NoDataAction {
  action: VscodeMessageAction.CloseAddDatabase | VscodeMessageAction.CloseEditDatabase
}

export interface CloseAddKeyAction {
  action: VscodeMessageAction.CloseAddKey
  data: RedisString
}

export type PostMessage =
  SelectKeyAction | DatabaseAction | InformationMessageAction | SelectedKeyAction | NoDataAction | CloseAddKeyAction
