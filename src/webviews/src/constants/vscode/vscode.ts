export enum VscodeState {
  SelectedKey = 'SelectedKey',
}

export enum VscodeMessageAction {
  AddKey = 'AddKey',
  EditDatabase = 'EditDatabase',
  InformationMessage = 'InformationMessage',
  ErrorMessage = 'ErrorMessage',
  AddCli = 'AddCli',
  SelectKey = 'SelectKey',
  RefreshTree = 'RefreshTree',
  AddDatabase = 'AddDatabase',
  CloseKey = 'CloseKey',
  CloseKeyAndRefresh = 'CloseKeyAndRefresh',
  EditKeyName = 'EditKeyName',
  OpenAddDatabase = 'OpenAddDatabase',
  CloseAddDatabase = 'CloseAddDatabase',
  CloseEditDatabase = 'CloseEditDatabase',
  SetSelectedKeyAction = 'SetSelectedKeyAction',
  SetDatabase = 'SetDatabase',
  CloseAddKey = 'CloseAddKey',
  CloseAddKeyAndRefresh = 'CloseAddKeyAndRefresh',
  ResetSelectedKey = 'ResetSelectedKey',
  UpdateSettings = 'UpdateSettings',
  UpdateSettingsDelimiter = 'UpdateSettingsDelimiter',
  SaveAppInfo = 'SaveAppInfo',
  ShowEula = 'ShowEula',
  CloseEula = 'CloseEula',
  UpdateDatabaseInList = 'UpdateDatabaseInList',
  CloudOAuth = 'CloudOAuth',
  OAuthCallback = 'OAuthCallback',
  RefreshDatabases = 'RefreshDatabases',
  OpenExternalUrl = 'OpenExternalUrl',
  OpenOAuthSsoDialog = 'OpenOAuthSsoDialog',
  CloseOAuthSsoDialog = 'CloseOAuthSsoDialog',
}

export enum VscodeStateItem {
  CliDatabase = 'CliDatabase',
}
