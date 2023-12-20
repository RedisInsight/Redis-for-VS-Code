import { KeyDto, KeyResponse, RedisString } from 'uiSrc/interfaces'

export interface ZSetState {
  loading: boolean
  searching: boolean
  data: ZSetDataState
  updateValue: {
    loading: boolean
  }
}

export interface ZSetActions {
  resetZSetStore: () => void
  resetZSetMembersStore: () => void
  processZSet: () => void
  processZSetFinal: () => void
  processZSetSuccess: (data: GetZSetMembersResponse, match: string) => void
  processZSetMoreSuccess: (data: GetZSetMembersResponse, match: string) => void
  removeMembers: (data: RedisString[]) => void
  updateMembers: (data: AddMembersToZSetDto) => void
}

export interface ZSetMember {
  name: RedisString
  score: number
}

export interface ZSetScanResponse extends KeyResponse {
  nextCursor: number
  total: number
  members: ZSetMember[]
}

export interface GetZSetMembersResponse extends ZSetScanResponse {
  total: number
}

export interface ModifiedGetZSetMembersResponse extends GetZSetMembersResponse {
  key?: RedisString
  match: string
}

export interface ZSetDataState extends ModifiedGetZSetMembersResponse {
  members: ZSetMember[]
}

export interface AddMembersToZSetDto extends KeyDto {
  members: ZSetMember[]
}
