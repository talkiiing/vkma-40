import { useEffect, useState } from 'react'

const useDebounce = (debouncableValue: any, delay: number = 300) => {
  const [debounced, setDebounced] = useState(debouncableValue)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(debouncableValue), delay)
    return () => clearInterval(timer)
  })

  return debounced
}

export default useDebounce
