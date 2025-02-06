export interface ISessionMetadata {
  userId: string
  sessionId: string
  uniqueId?: string
}

export interface SessionMetadata extends ISessionMetadata {
  userId: string
  sessionId: string
  uniqueId?: string
  correlationId?: string
}
