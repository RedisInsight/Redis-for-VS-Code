import { KeyDto, KeyResponse, RedisString } from 'uiSrc/interfaces'

export interface SetState {
  loading: boolean
  error: string
  data: SetDataState
}

export interface SetScanResponse extends KeyResponse {
  nextCursor: number
  total: number
  members: RedisString[]
}

export interface GetSetMembersResponse extends SetScanResponse {
  total: number
}

export interface ModifiedGetSetMembersResponse extends GetSetMembersResponse {
  key?: RedisString
  match: string
}

export interface SetDataState extends ModifiedGetSetMembersResponse {
  members: RedisString[]
}

export interface AddMembersToSetDto extends KeyDto {
  members: RedisString[]
}

export interface SetActions {
  processSetRequest: () => void
  processSetResponse: () => void
  processSetFailure: (payload: string) => void
  setSetMembers: (data: RedisString[]) => void
  loadSetMembers: ([match, resetData]: [string, boolean | undefined]) => void
  loadSetMembersSuccess: (data: GetSetMembersResponse) => void
  loadMoreSetMembersSuccess: (data: GetSetMembersResponse) => void
  removeMembersFromList: (members: RedisString[]) => void
}
