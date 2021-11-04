import { configureStore } from '@reduxjs/toolkit'
import { settingsSlice } from './settings/settings'
import { cacheSlice } from './cache/cache'

export default configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    cache: cacheSlice.reducer,
  },
})
