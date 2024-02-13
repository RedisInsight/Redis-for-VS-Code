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
  CloseAddDatabase = 'CloseAddDatabase',
  CloseEditDatabase = 'CloseEditDatabase',
  CloseAddKey = 'CloseAddKey',
  CloseAddKeyAndRefresh = 'CloseAddKeyAndRefresh',
}
