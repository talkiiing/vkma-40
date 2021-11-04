import { useHistory } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

interface QueryObject extends Record<string, string> {}

const useQuery = () => {
  const history = useHistory()

  const query = useMemo(
    () => new URLSearchParams(history.location.search),
    [history.location.search],
  )

  const queryPush = useCallback(
    (data: QueryObject) => {
      history.push({ search: new URLSearchParams(data).toString() })
    },
    [history],
  )

  const queryPatch = useCallback(
    (data: QueryObject) => {
      history.push({
        search: new URLSearchParams({
          ...Array.from(query.entries()).reduce(
            (a, v) => ({ ...a, [v[0]]: v[1] }),
            {},
          ),
          ...data,
        }).toString(),
      })
    },
    [history, query],
  )

  const queryDelete = useCallback(
    (omitted: string) => {
      history.push({
        search: new URLSearchParams(
          Array.from(query.entries()).filter((v) => !omitted.includes(v[0])),
        ).toString(),
      })
    },
    [history, query],
  )

  const queryClean = useCallback(() => {
    history.push({
      search: '',
    })
  }, [history])

  return {
    query,
    queryPush,
    queryPatch,
    queryDelete,
    queryClean,
  }
}

export default useQuery
