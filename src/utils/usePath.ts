import { useHistory } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

const usePath = () => {
  const history = useHistory()

  const stringPath = useMemo(
    () => history.location.pathname,
    [history.location.pathname],
  )

  const arrayPath = useMemo(
    () => history.location.pathname.split('/'),
    [history.location.pathname],
  )

  const go = useCallback(
    (pathName: string) => {
      history.push({ pathname: pathName })
    },
    [history],
  )

  return { go, stringPath, arrayPath }
}

export default usePath
