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
  data: {
    database: Database
    keyInfo: {
      key: RedisString
      keyString: string
      keyType: AllKeyTypes
      displayedKeyType?: string
    }
  }
}

export interface SetDatabaseAction {
  action: VscodeMessageAction.EditDatabase
  | VscodeMessageAction.AddKey
  | VscodeMessageAction.CloseEditDatabase
  | VscodeMessageAction.RefreshTree
  | VscodeMessageAction.SetDatabase
  data: {
    database: Database
  }
}
export interface CliAction {
  action: VscodeMessageAction.AddCli
  data: {
    database: Database
  }
}

export interface InformationMessageAction {
  action: VscodeMessageAction.InformationMessage | VscodeMessageAction.ErrorMessage
  data: string
}

export interface SelectedKeyAction {
  action:
  VscodeMessageAction.CloseKeyAndRefresh |
  VscodeMessageAction.CloseAddKeyAndRefresh |
  VscodeMessageAction.SetSelectedKeyAction |
  VscodeMessageAction.EditKeyName
  data: {
    database: Database
    type: SelectedKeyActionType
    keyInfo: {
      key?: RedisString
      keyType?: KeyTypes
      newKey?: RedisString
      newKeyString?: string
      keyString?: string
      displayedKeyType?: string
    }
  }
}

export interface SelectedKeyCloseAction {
  action: VscodeMessageAction.CloseKey
}

export interface NoDataAction {
  action: VscodeMessageAction.CloseAddDatabase
  | VscodeMessageAction.OpenAddDatabase
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
  action: VscodeMessageAction.SaveAppInfo
  data: Partial<AppInfoStore>
}

export interface ShowEulaAction {
  action: VscodeMessageAction.ShowEula
}

export interface CloseEulaAction {
  action: VscodeMessageAction.CloseEula
}

export type PostMessage =
  SelectKeyAction |
  SetDatabaseAction |
  InformationMessageAction |
  SelectedKeyAction |
  NoDataAction |
  CloseAddKeyAction |
  UpdateSettingsAction |
  UpdateSettingsDelimiterAction |
  SelectedKeyCloseAction |
  SaveAppInfoAction |
  ShowEulaAction |
  CloseEulaAction |
  ResetSelectedKeyAction |
  CliAction
