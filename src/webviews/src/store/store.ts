import { configureStore, combineReducers } from '@reduxjs/toolkit'
import cliSettingsReducer from 'uiSrc/modules/cli/slice/cli-settings'
import outputReducer from 'uiSrc/modules/cli/slice/cli-output'

export const rootReducers = {
  cli: combineReducers({
    settings: cliSettingsReducer,
    output: outputReducer,
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
