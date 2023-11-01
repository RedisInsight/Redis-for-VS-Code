import { SortOrder } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

export interface StateAppContext {
  contextInstanceId: string
  lastPage: string
  dbConfig: {
    treeViewDelimiter: string
    treeViewSort: SortOrder
  }
  keys: {
    tree: {
      delimiter: string
      openNodes: {
        [key: string]: boolean
      }
      selectedLeaf: Nullable<string>
    }
  }
}
