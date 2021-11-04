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
import { useCallback, useEffect, useState } from 'react'
import { Main } from './pages/Main'

const App = () => {
  const { viewWidth, viewHeight } = useAdaptivity()
  const { data: activePanel, setData: setActivePanel } = useCached(
    'activePanel',
    async () => 'main'
  )

  const [fetchedUser, setUser] = useState<UserInfo>()
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
  }, [])

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
