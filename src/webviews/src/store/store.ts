import { createBrowserHistory } from 'history'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import keysReducer from 'uiSrc/slices/browser/keys.slice'
import userSettingsReducer from 'uiSrc/slices/user/user-settings.slice'
import appInfoReducer from 'uiSrc/slices/app/info/info.slice'
import appRedisCommandsReducer from 'uiSrc/slices/app/commands/redis-commands.slice'
import databasesReducer from 'uiSrc/slices/connections/databases/databases.slice'
import appContextReducer from 'uiSrc/slices/app/context/context.slice'
import cliSettingsReducer from 'uiSrc/modules/cli/slice/cli-settings'
import outputReducer from 'uiSrc/modules/cli/slice/cli-output'

export const history = createBrowserHistory()

export const rootReducers = {
  app: combineReducers({
    info: appInfoReducer,
    context: appContextReducer,
    redisCommands: appRedisCommandsReducer,
  }),
  connections: combineReducers({
    databases: databasesReducer,
  }),
  cli: combineReducers({
    settings: cliSettingsReducer,
    output: outputReducer,
  }),
  user: combineReducers({
    settings: userSettingsReducer,
  }),
}

export const rootReducer = combineReducers(rootReducers)

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
