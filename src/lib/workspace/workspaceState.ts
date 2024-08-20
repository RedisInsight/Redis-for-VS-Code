import * as vscode from 'vscode'

class WorkspaceStateService {
  private readonly context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  get<T>(key: string = ''): T | null {
    try {
      return this.context.workspaceState.get<T>(key) || null
    } catch (error) {
      console.error(`get from workspace state error: ${error}`)
      return null
    }
  }

  async set(key: string = '', item: any) {
    try {
      await this.context.workspaceState.update(key, item)
    } catch (error) {
      console.error(`update to workspace state error: ${error}`)
    }
  }

  async remove(key: string = '') {
    await this.context.workspaceState.update(key, undefined)
  }

  getAll() {
    return this.context.workspaceState.keys()
  }
}

export const initWorkspaceState = async (context: vscode.ExtensionContext) => {
  workspaceStateService = new WorkspaceStateService(context)

  // clear app cache
  await workspaceStateService.set('ui', {})
}

export const getObjectStorageField = (itemName = '', field = '') => {
  try {
    return (workspaceStateService?.get(itemName) as any)?.[field]
  } catch (e) {
    return null
  }
}

export const setObjectStorageField = async (itemName = '', field = '', value?: any) => {
  try {
    const config: Config = workspaceStateService?.get(itemName) || {}

    if (value === undefined) {
      delete config[field]

      await workspaceStateService?.set(itemName, config)
      return
    }

    await workspaceStateService?.set(itemName, {
      ...config,
      [field]: value,
    })
  } catch (e) {
    console.error(e)
  }
}

interface Config {
  [key: string]: any;
}

export const getUIStorage = () =>
  workspaceStateService?.get('ui') || {}

export const getUIStorageField = (field: string = '') =>
  getObjectStorageField('ui', field)

export const setUIStorageField = async (field: string = '', value?: any) => {
  await setObjectStorageField('ui', field, value)
}

// eslint-disable-next-line import/no-mutable-exports
export let workspaceStateService: WorkspaceStateService

export { WorkspaceStateService }
