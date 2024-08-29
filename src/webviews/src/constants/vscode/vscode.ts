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
  OpenCli = 'OpenCli',
  RefreshTree = 'RefreshTree',
  RefreshKey = 'RefreshKey',
  CloseKey = 'CloseKey',
  CloseKeyAndRefresh = 'CloseKeyAndRefresh',
  EditKeyName = 'EditKeyName',
  OpenAddDatabase = 'OpenAddDatabase',
  CloseAddDatabase = 'CloseAddDatabase',
  CloseEditDatabase = 'CloseEditDatabase',
  CloseAddKey = 'CloseAddKey',
  CloseAddKeyAndRefresh = 'CloseAddKeyAndRefresh',
  ResetSelectedKey = 'ResetSelectedKey',
  UpdateSettings = 'UpdateSettings',
  UpdateSettingsDelimiter = 'UpdateSettingsDelimiter',
  SaveAppInfo = 'SaveAppInfo',
  ShowEula = 'ShowEula',
  CloseEula = 'CloseEula',
}

export enum VscodeStateItem {
  CliDatabase = 'CliDatabase',
}
