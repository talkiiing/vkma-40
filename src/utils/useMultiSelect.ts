import { useState } from 'react'

export interface IUseMultiSelect<T> {
  bind: {
    updateValue: (
      newSet: T[]
    ) => any
    value: T[]
  }
  setValue: (newValue: T[]) => any
  reset: () => any
  value: T[]
}

const useMultiSelect = <T>(defaultValue: T[]): IUseMultiSelect<T> => {
  const [value, setValue] = useState<T[]>(defaultValue)
  return {
    value,
    setValue: (newValue) => setValue(newValue),
    reset: () => setValue(defaultValue),
    bind: {
      updateValue: (newSet: T[]) => setValue(newSet),
      value: value,
    },
  }
}

export default useMultiSelect
