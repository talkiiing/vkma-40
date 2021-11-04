import { RefObject, useCallback, useMemo, useRef, useState } from 'react'

export interface IUseSelect {
  bind: {
    setValue: (newValue: string[]) => any
    value: string[]
    nodeRef: RefObject<HTMLDivElement>
  }
  setValue: (newValue: string[]) => any
  reset: () => any
  value: string[]
  computed: string
  multiselect?: boolean
}

const useSelect = (
  defaultValue: string[] | string,
  options?: {
    multiselect?: boolean
  }
): IUseSelect => {
  const computedInitial = useMemo(
    () =>
      defaultValue.length
        ? defaultValue instanceof Array
          ? defaultValue
          : [defaultValue]
        : [],
    [defaultValue]
  )
  const [value, setValue] = useState(computedInitial)
  const setValueHandler = useCallback(
    (newValue: string[]) => setValue(newValue.filter((v) => v.length)),
    []
  )
  const computed = useMemo(() => value.join(','), [value])

  const selectBoundsRef = useRef<HTMLDivElement>(null)

  return {
    value,
    setValue: setValueHandler,
    reset: () => setValue([]),
    bind: {
      setValue: setValueHandler,
      value: value,
      nodeRef: selectBoundsRef
    },
    computed: computed,
    multiselect: options?.multiselect,
  }
}

export default useSelect
