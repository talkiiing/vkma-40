import {
  Button,
  Cell,
  Group,
  PanelHeader,
  Placeholder,
  Platform,
  Separator,
  usePlatform,
} from '@vkontakte/vkui'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import useCached from '../utils/useCached'
import {
  Icon20Check,
  Icon24Dismiss,
  Icon24UserAdd,
  Icon24Users,
  Icon56UserCircleOutline,
} from '@vkontakte/icons'
import bridge, { VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge'
import { Friend } from '../utils/models/General.model'
import { Handshake } from '../components/Handshake'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AnyReceiveMethodName,
  VKBridgeEvent,
} from '@vkontakte/vk-bridge/dist/types/src/types/bridge'

export interface MainProps extends GoInterface {
  setLoading: (state: boolean) => void
}

export const Main = (props: MainProps) => {
  const { data: friend, setData: setFriend } = useCached<Friend | null>(
    'friend',
    async () => null
  )
  const platform = usePlatform()

  const [friendOnline, setFriendOnline] = useState(false)

  const [handshakeSucceed, setHandshakeSucceed] = useState(false)
  const [vibro, setVibro] = useState(false)

  const accelHandler = useCallback(
    (fn: (success: boolean) => void): VKBridgeSubscribeHandler => {
      let submitter = 7

      const handle = ({ x, y, z }: { x: string; y: string; z: string }) => {
        if (parseInt(x) > 6 || parseInt(y) > 6 || parseInt(y) > 6) {
          console.log('subm', submitter)
          submitter--
          if (submitter < 0) {
            fn(true)
          }
        }
      }

      return (e: VKBridgeEvent<AnyReceiveMethodName>) => {
        if (e.detail.type === 'VKWebAppAccelerometerChanged') {
          //console.log(e.detail.data)
          handle(e.detail.data)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (handshakeSucceed) {
      setVibro(true)
      let timer = setTimeout(() => setVibro(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [handshakeSucceed])

  useEffect(() => {
    if (vibro) {
      let timer = setInterval(() => {
        bridge.send('VKWebAppTapticImpactOccurred', { style: 'medium' })
      }, 200)
      return () => clearInterval(timer)
    }
  }, [vibro])

  const reset = useCallback(() => {
    if (handshakeSucceed) {
      setFriend(null)
      setFriendOnline(false)
      setHandshakeSucceed(false)
    }
  }, [handshakeSucceed])

  const handlerBundle = useMemo(
    () => accelHandler(setHandshakeSucceed),
    [accelHandler, handshakeSucceed]
  )

  useEffect(() => {
    return () => setVibro(false)
  }, [friend])

  useEffect(() => {
    if (handshakeSucceed) {
      bridge.unsubscribe(handlerBundle)
    } else {
      friendOnline && bridge.subscribe(handlerBundle)
      return () => bridge.unsubscribe(handlerBundle)
    }
  }, [accelHandler, friendOnline, handlerBundle, handshakeSucceed])

  return (
    <>
      <PanelHeader>Жим-жим</PanelHeader>
      {platform !== Platform.VKCOM ? (
        <Group>
          {!friend ? (
            <Placeholder
              icon={<Icon56UserCircleOutline />}
              header='Выберите друга'
              action={
                <Button
                  size='m'
                  onClick={async () =>
                    setFriend(
                      ((
                        await bridge.send('VKWebAppGetFriends', {
                          multi: false,
                        })
                      )?.users[0] as Friend) || null
                    )
                  }
                  before={<Icon24UserAdd className='h-4 w-4' />}
                  mode='primary'
                >
                  Выбрать
                </Button>
              }
            >
              Чтобы пожать ему руку дистанционно, времена то непростые...
            </Placeholder>
          ) : (
            <>
              <Placeholder
                icon={
                  <img
                    src={friend.photo_200}
                    alt={friend.first_name}
                    className='w-14 h-14 rounded-full'
                  />
                }
                header={`${friend.first_name} ${friend.last_name}`}
                action={
                  <div className='flex flex-col space-y-3 items-center'>
                    {handshakeSucceed ? (
                      <>
                        <Button
                          size='m'
                          onClick={async () => {
                            reset()
                            setFriend(
                              ((
                                await bridge.send('VKWebAppGetFriends', {
                                  multi: false,
                                })
                              )?.users[0] as Friend) || null
                            )
                          }}
                          before={<Icon24Users className='h-4 w-4' />}
                          mode='primary'
                        >
                          Выбрать друга снова
                        </Button>
                        <Button
                          size='m'
                          onClick={() => {
                            reset()
                            setFriend(null)
                          }}
                          before={<Icon24Dismiss className='h-4 w-4' />}
                          mode='secondary'
                        >
                          Закончить
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size='m'
                          onClick={async () =>
                            setFriend(
                              ((
                                await bridge.send('VKWebAppGetFriends', {
                                  multi: false,
                                })
                              )?.users[0] as Friend) || null
                            )
                          }
                          before={<Icon24Users className='h-4 w-4' />}
                          mode='secondary'
                        >
                          Сменить друга
                        </Button>
                        <Button
                          size='m'
                          onClick={() => setFriend(null)}
                          before={<Icon24Dismiss className='h-4 w-4' />}
                          mode='destructive'
                        >
                          Отказаться
                        </Button>
                      </>
                    )}
                  </div>
                }
              >
                <span className='animate-pulse'>
                  {handshakeSucceed
                    ? 'Вы успешно пожали руки!'
                    : friendOnline
                    ? 'Продолжайте трясти телефоны, пока не получится рукопожатие'
                    : 'Мы ожидаем, пока Ваш друг зайдет в приложение...'}
                </span>
              </Placeholder>
              <Button
                size='m'
                onClick={() => {
                  bridge.send(
                    friendOnline
                      ? 'VKWebAppAccelerometerStop'
                      : 'VKWebAppAccelerometerStart',
                    { refresh_rate: '100' }
                  )
                  setFriendOnline((v) => !v)
                }}
                before={<Icon20Check className='h-4 w-4' />}
                mode='commerce'
              >
                Сменить {friendOnline ? 'y' : 'n'}
              </Button>
              <Separator />
              <Handshake active={handshakeSucceed} />
            </>
          )}
        </Group>
      ) : (
        <Group>
          <Cell>
            К сожалению, запуск возможен только в мобильных клиентах...
          </Cell>
        </Group>
      )}
    </>
  )
}
