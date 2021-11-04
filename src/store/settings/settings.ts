import { createSlice } from '@reduxjs/toolkit'

export const StorageKeySettings = 'settings'

export interface IOptionForm {
  id: string
  value: string
}

export const EAnimationTypes: IOptionForm[] = [
  { id: 'none', value: 'Нет' },
  { id: 'slide', value: 'Сдвиг' },
  { id: 'flight', value: 'Вылет' },
  { id: 'flightHard', value: 'Большой вылет' },
]

export const EColorSchemes: IOptionForm[] = [
  { id: 'default', value: 'По умолчанию' },
  { id: 'light', value: 'Светлая' },
  { id: 'dark', value: 'Темная' },
]

export interface SettingsModel extends Record<string, any> {
  options: {
    animationType: IOptionForm['id']
    colorScheme: IOptionForm['id']
  }
  isReady: boolean
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    options: {
      animationType: 'flight',
      colorScheme: 'light',
    },
    isReady: false,
  },
  reducers: {
    setOptions: (state, action) => {
      state.options = { ...state.options, ...action.payload }
      localStorage.setItem(StorageKeySettings, JSON.stringify(state))
    },
  },
})

// Action creators are generated for each case reducer function
export const { setOptions } = settingsSlice.actions

export default settingsSlice.reducer
