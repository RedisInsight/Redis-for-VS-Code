export enum CloudAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export interface CloudAuthResponse {
  status: CloudAuthStatus
  message?: string
  error?: any
}
