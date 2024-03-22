export enum ExecuteCommand {
  OpenPage = 'RedisInsight.openPage',
}

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
  CloseKeyAndRefresh = 'CloseKeyAndRefresh',
  EditKeyName = 'EditKeyName',
  CloseAddDatabase = 'CloseAddDatabase',
  CloseEditDatabase = 'CloseEditDatabase',
  CloseAddKey = 'CloseAddKey',
  CloseAddKeyAndRefresh = 'CloseAddKeyAndRefresh',
  ResetSelectedKey = 'ResetSelectedKey',
  UpdateSettings = 'UpdateSettings',
  UpdateSettingsDelimiter = 'UpdateSettingsDelimiter',
}

export enum VscodeStateItem {
  CliDatabase = 'CliDatabase',
}
