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
import { Collections } from './pages/Collections'

const App = () => {
  const { viewWidth, viewHeight } = useAdaptivity()
  const { data: activePanel, setData: setActivePanel } = useCached(
    'activePanel',
    async () => 'main'
  )

  const { data: qrList, setData: setQrList } = useCached(
    'qr_history',
    async () => []
  )

  const [fetchedUser, setUser] = useState<UserInfo>()
  const [popout, setPopout] = useState(true)

  const fetchList = useCallback(async () => {
    setPopout(true)
    const qrsRaw = (
      await bridge.send('VKWebAppStorageGet', {
        keys: ['history'],
      })
    ).keys.find((v) => v.key === 'history')
    const qrs = JSON.parse((qrsRaw && qrsRaw.value) || '[]')
    setQrList(qrs)
    setPopout(false)
  }, [])

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
    fetchList()
  }, [])

  useEffect(() => {
    if (qrList && qrList.length) {
      bridge.send('VKWebAppStorageSet', {
        key: 'history',
        value: JSON.stringify(qrList),
      })
    }
  }, [qrList])

  const go = useCallback((page) => setActivePanel(page), [])

  return (
    <SplitLayout header={<PanelHeader separator={false} />}>
      <SplitCol spaced={viewWidth && viewWidth > ViewWidth.MOBILE}>
        <View
          activePanel={activePanel}
          popout={popout ? <ScreenSpinner size='large' /> : null}
        >
          <Panel id='main'>
            <Main go={go} setLoading={setPopout} fetchItems={fetchList} />
          </Panel>
          <Panel id='collections'>
            <Collections go={go} fetchItems={fetchList} />
          </Panel>
        </View>
      </SplitCol>
    </SplitLayout>
  )
}

export default App
