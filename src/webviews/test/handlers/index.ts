import browser from './browser'
import database from './database'
import app from './app'
import oauth from './oauth'

// @ts-ignore
export const handlers: any[] = [].concat(
  app,
  browser,
  database,
  oauth,
)
