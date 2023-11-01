import { isObjectLike } from 'lodash'
import { StorageItem } from 'uiSrc/constants'

class StorageService {
  private storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  get(itemName: string = '') {
    let item
    try {
      item = this.storage.getItem(itemName)
    } catch (error) {
      console.error(`getItem from storage error: ${error}`)
    }

    if (item) {
      try {
        return JSON.parse(item)
      } catch (e) {
        return item
      }
    }
    return null
  }

  getAll() {
    return this.storage
  }

  set(itemName: string = '', item: any) {
    try {
      if (isObjectLike(item)) {
        this.storage.setItem(itemName, JSON.stringify(item))
      } else {
        this.storage.setItem(itemName, item)
      }
    } catch (error) {
      console.error(`setItem to storage error: ${error}`)
    }
  }

  remove(itemName: string = '') {
    this.storage.removeItem(itemName)
  }
}
export const localStorageService = new StorageService(localStorage)
export const sessionStorageService = new StorageService(sessionStorage)

export const getDBConfigStorageField = (instanceId: string, field: string = '') => {
  try {
    return localStorageService.get(StorageItem.dbConfig + instanceId)?.[field]
  } catch (e) {
    return null
  }
}

export const setDBConfigStorageField = (instanceId: string, field: string = '', value?: any) => {
  try {
    const config = localStorageService.get(StorageItem.dbConfig + instanceId) || {}

    if (value === undefined) {
      delete config[field]
      localStorageService.set(StorageItem.dbConfig + instanceId, config)
      return
    }

    localStorageService.set(StorageItem.dbConfig + instanceId, {
      ...config,
      [field]: value,
    })
  } catch (e) {
    console.error(e)
  }
}

export default StorageService
