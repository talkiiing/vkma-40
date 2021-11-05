import {
  useAdaptivity,
  SplitLayout,
  SplitCol,
  ViewWidth,
  View,
  Panel,
  PanelHeader,
  ScreenSpinner,
} from '@vkontakte/vkui'
import useCached from './utils/useCached'
import bridge, { UserInfo } from '@vkontakte/vk-bridge'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Main } from './pages/Main'
import sock from './utils/service/sock.service'
import SocketIO from './utils/service/SocketIO'

const App = () => {
  const { viewWidth, viewHeight } = useAdaptivity()
  const { data: activePanel, setData: setActivePanel } = useCached(
    'activePanel',
    async () => 'main'
  )

  const { data: fetchedUser, setData: setUser } = useCached<UserInfo | null>(
    'user',
    async () => null
  )

  const [popout, setPopout] = useState(true)

  useEffect(() => {
    bridge.subscribe(({ detail: { type, data } }) => {
      //console.log(type, data)
    })
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo')
      setUser(user)
      setPopout(false)
    }
    fetchData()

    sock.onAny((...all) => console.log(all))
  }, [])

  useEffect(() => {
    const id = fetchedUser?.id
    console.log('authing as ', id, sock)
    let timer = setTimeout(() => {
      console.log('Sending auth')
      sock.emit('auth', id)
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchedUser])

  const go = useCallback((page) => setActivePanel(page), [])

  return (
    <SplitLayout header={<PanelHeader separator={false} />}>
      <SplitCol spaced={viewWidth && viewWidth > ViewWidth.MOBILE}>
        <View
          activePanel={activePanel}
          popout={popout ? <ScreenSpinner size='large' /> : null}
        >
          <Panel id='main'>
            <Main setLoading={setPopout} go={go} />
          </Panel>
        </View>
      </SplitCol>
    </SplitLayout>
  )
}

export default App
