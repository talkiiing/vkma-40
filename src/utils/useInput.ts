import { ChangeEvent, useState } from 'react'

export interface IUseInput<T> {
  bind: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => any
    value: T
  }
  setValue: (newValue: T) => any
  reset: () => any
  value: T
}

const useInput = <T>(defaultValue: T): IUseInput<T> => {
  const [value, setValue] = useState<T>(defaultValue)
  return {
    value,
    setValue: (newValue) => setValue(newValue),
    reset: () => setValue(defaultValue),
    bind: {
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setValue((e.target ? e.target.value : (e as unknown)) as T),
      value: value,
    },
  }
}


export default useInput

