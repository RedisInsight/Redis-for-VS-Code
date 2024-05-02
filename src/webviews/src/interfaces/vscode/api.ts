import { AllKeyTypes, KeyTypes, SelectedKeyActionType, VscodeMessageAction } from 'uiSrc/constants'
import { Database } from 'uiSrc/store'
import { AppInfoStore, GetAppSettingsResponse } from 'uiSrc/store/hooks/use-app-info-store/interface'
import { RedisString } from '../core/app'

export interface IVSCodeApi {
  getState: () => any
  setState: (newState: any) => any
  postMessage: (message: PostMessage) => void
}

export interface ResetSelectedKeyAction {
  action: VscodeMessageAction.ResetSelectedKey
}

export interface SelectKeyAction {
  action: VscodeMessageAction.SelectKey
  data: { key: RedisString, keyString: string, keyType: AllKeyTypes, databaseId: string }
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
  action:
  VscodeMessageAction.CloseKeyAndRefresh |
  VscodeMessageAction.CloseAddKeyAndRefresh |
  VscodeMessageAction.RefreshTree |
  VscodeMessageAction.EditKeyName
  data: { key?: RedisString, type: SelectedKeyActionType, databaseId: string, keyType?: KeyTypes, newKey?: RedisString, keyString?: string }
}

export interface SelectedKeyCloseAction {
  action: VscodeMessageAction.CloseKey
}

export interface NoDataAction {
  action: VscodeMessageAction.CloseAddDatabase | VscodeMessageAction.CloseEditDatabase
}

export interface CloseAddKeyAction {
  action: VscodeMessageAction.CloseAddKey
  data: RedisString
}

export interface UpdateSettingsAction {
  action: VscodeMessageAction.UpdateSettings
  data: GetAppSettingsResponse
}

export interface UpdateSettingsDelimiterAction {
  action: VscodeMessageAction.UpdateSettingsDelimiter
  data: string
}

export interface SaveAppInfoAction {
  action: VscodeMessageAction.SaveAppInfo,
  data: Partial<AppInfoStore>
}

export type PostMessage =
  SelectKeyAction |
  DatabaseAction |
  InformationMessageAction |
  SelectedKeyAction |
  NoDataAction |
  CloseAddKeyAction |
  UpdateSettingsAction |
  UpdateSettingsDelimiterAction |
  SelectedKeyCloseAction |
  SaveAppInfoAction |
  ResetSelectedKeyAction
