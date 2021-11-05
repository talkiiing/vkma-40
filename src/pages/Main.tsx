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
import bridge, {
  UserInfo,
  VKBridgeSubscribeHandler,
} from '@vkontakte/vk-bridge'
import { Friend } from '../utils/models/General.model'
import { Handshake } from '../components/Handshake'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AnyReceiveMethodName,
  VKBridgeEvent,
} from '@vkontakte/vk-bridge/dist/types/src/types/bridge'
import sock from '../utils/service/sock.service'

export interface MainProps extends GoInterface {
  setLoading: (state: boolean) => void
}

const createPair = (your_id: any, fri_id: any) =>
  sock.emit('pair', your_id, fri_id)

const createDivorce = (your_id: any, fri_id: any) =>
  sock.emit('divorce', your_id.toString(), fri_id.toString())

export const Main = (props: MainProps) => {
  const { data: friend, setData: setFriend } = useCached<Friend | null>(
    'friend',
    async () => null
  )

  const { data: fetchedUser } = useCached<UserInfo | null>('user')

  const platform = usePlatform()

  const [friendOnline, setFriendOnline] = useState(false)

  const [handshakeSucceed, setHandshakeSucceed] = useState(false)
  const [vibro, setVibro] = useState(false)

  const accelHandler = useCallback(
    (fn: CallableFunction): VKBridgeSubscribeHandler => {
      let submitter = 7

      const handle = ({ x, y, z }: { x: string; y: string; z: string }) => {
        if (
          Math.abs(parseInt(x)) > 6 ||
          Math.abs(parseInt(y)) > 6 ||
          Math.abs(parseInt(y)) > 6
        ) {
          submitter--
          if (submitter < 0) {
            fn()
            submitter = 7
          }
        }
      }

      return (e: VKBridgeEvent<AnyReceiveMethodName>) => {
        if (e.detail.type === 'VKWebAppAccelerometerChanged') {
          //console.log(e.detail.data)
          handle(e.detail.data)
          console.log('subm', submitter)
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

  const manageAccel = useCallback((on: boolean) => {
    bridge.send(
      on ? 'VKWebAppAccelerometerStart' : 'VKWebAppAccelerometerStop',
      { refresh_rate: '100' }
    )
  }, [])

  const handlerBundle = useMemo((): VKBridgeSubscribeHandler => {
    //console.log('bundle rebuild', fetchedUser?.id, friend?.id)
    return accelHandler(() => sock.emit('shake', fetchedUser?.id, friend?.id))
  }, [accelHandler, fetchedUser, friend])

  useEffect(() => {
    return () => setVibro(false)
  }, [friend])

  useEffect(() => {
    if (handshakeSucceed) {
      bridge.unsubscribe(handlerBundle)
      manageAccel(false)
    } else {
      if (friendOnline) {
        manageAccel(true)
        bridge.subscribe(handlerBundle)
      }
      return () => {
        bridge.unsubscribe(handlerBundle)
        manageAccel(false)
      }
    }
  }, [friendOnline, handlerBundle, handshakeSucceed])

  const handleDivorce = useCallback((friendId: number) => {
    setFriendOnline(false)
    console.log('divorced ', friendId)
  }, [])

  const handleCreate = useCallback(
    (friendId: number) => {
      if (friendId === friend?.id) {
        setFriendOnline(true)
        console.log('created ', friendId)
        manageAccel(true)
      } else {
        console.log('dodged ', friendId)
      }
    },
    [friend]
  )

  const handleHandshakeSucceed = useCallback((friendId: number) => {
    setHandshakeSucceed(true)
    manageAccel(false)
    console.log('shaked ', friendId)
  }, [])

  useEffect(() => {
    sock.on('pair-divorced', handleDivorce)
  }, [])

  useEffect(() => {
    sock.on('pair-handshaked', handleHandshakeSucceed)
  }, [])

  useEffect(() => {
    sock.on('pair-created', handleCreate)
    return () => {
      sock.off('pair-created', handleCreate)
    }
  }, [handleCreate])

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
                  onClick={async () => {
                    const person =
                      ((
                        await bridge.send('VKWebAppGetFriends', {
                          multi: false,
                        })
                      )?.users[0] as Friend) || null
                    setFriend(person)
                    if (fetchedUser && person) {
                      createPair(fetchedUser.id, person.id)
                    }
                  }}
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
                            const person =
                              ((
                                await bridge.send('VKWebAppGetFriends', {
                                  multi: false,
                                })
                              )?.users[0] as Friend) || null
                            setFriend(person)
                            if (fetchedUser && person) {
                              createPair(fetchedUser.id, person.id)
                            }
                          }}
                          before={<Icon24Users className='h-4 w-4' />}
                          mode='commerce'
                        >
                          Выбрать друга снова
                        </Button>
                        <Button
                          size='m'
                          onClick={() => {
                            reset()
                            createDivorce(fetchedUser?.id, friend.id)
                            setFriend(null)
                          }}
                          before={<Icon24Dismiss className='h-4 w-4' />}
                          mode='primary'
                        >
                          Закончить
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size='m'
                          onClick={async () => {
                            const person =
                              ((
                                await bridge.send('VKWebAppGetFriends', {
                                  multi: false,
                                })
                              )?.users[0] as Friend) || null
                            setFriend(person)
                            if (fetchedUser && person) {
                              createPair(fetchedUser.id, person.id)
                            }
                          }}
                          before={<Icon24Users className='h-4 w-4' />}
                          mode='secondary'
                        >
                          Сменить друга
                        </Button>
                        <Button
                          size='m'
                          onClick={() => {
                            if (fetchedUser && friend) {
                              createDivorce(fetchedUser.id, friend.id)
                            }
                            setFriend(null)
                          }}
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
