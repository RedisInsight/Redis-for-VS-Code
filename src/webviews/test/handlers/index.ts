import browser from './browser'
import database from './database'
import app from './app'

// @ts-ignore
export const handlers: any[] = [].concat(
  app,
  browser,
  database,
)
