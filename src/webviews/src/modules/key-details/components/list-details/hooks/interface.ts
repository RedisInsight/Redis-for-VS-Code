import { KeyDto, KeyResponse, Nullable, RedisString } from 'uiSrc/interfaces'

export interface ListState {
  loading: boolean
  data: ListDataState
  updateValue: {
    loading: boolean
  }
}

export interface ListActions {
  resetListStore: () => void
  processList: () => void
  processListFinal: () => void
  processListSuccess: (data: GetListElementsResponse) => void
  processSearchListElement: (data?: ListElement) => void
  processListMoreSuccess: (data: GetListElementsResponse) => void
  updateElementInList: (data: SetListElementDto) => void
}

export interface ListElement {
  index: number
  element: RedisString
}

export interface ListScanResponse extends KeyResponse {
  elements: RedisString[]
}

export interface GetListElementsResponse extends ListScanResponse {
  total: number
}

export interface SearchListElementResponse extends ListScanResponse {
  value: RedisString
}

export interface ModifiedGetListMembersResponse extends GetListElementsResponse {
  key?: RedisString
  match?: string
}

export interface ListDataState extends Omit<ModifiedGetListMembersResponse, 'elements'> {
  elements: ListElement[]
  searchedIndex: Nullable<number>
}

export interface AddElementsToListDto extends KeyDto {
  elements: ListElement[]
}

export interface SetListElementDto extends KeyDto {
  element: RedisString
  index: number
}
