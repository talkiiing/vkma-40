import {
  Button,
  Cell,
  Group,
  PanelHeader,
  Placeholder,
  Platform,
  Progress,
  Separator,
  Div,
  IconButton,
  Input,
  Header,
} from '@vkontakte/vkui'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import { useCallback, useEffect, useMemo, useState } from 'react'
import bridge, { UserInfo } from '@vkontakte/vk-bridge'
import { Icon24Similar } from '@vkontakte/icons'
import { WifiIcon } from '@heroicons/react/outline'
import sock from '../utils/service/sock.service'
import useCached from '../utils/useCached'
import { Simulate } from 'react-dom/test-utils'

const initialPattern = [false, false, false, false, false, false, false, false]
const ticks = 8

export interface MainProps extends GoInterface {
  setLoading: (state: boolean) => void
}

export const LooperDJ = (props: MainProps) => {
  const [playState, setPlayState] = useState(false)
  const [pattern, setPattern] = useState<boolean[]>(initialPattern)
  const [startTime, setStartTime] = useState<number>()
  const [tick, setTick] = useState<number>(0)
  const [hashId, setHashId] = useState<string>('')

  const { data: fetchedUser } = useCached<UserInfo | null>('user')

  useEffect(() => {
    sock.emit(playState ? 'start' : 'stop', fetchedUser?.id, hashId)
    if (playState) {
      setTick((t) => (t + 1) % ticks)
      let timer = setInterval(() => setTick((t) => (t + 1) % ticks), 1000)
      return () => clearInterval(timer)
    }
  }, [playState, fetchedUser, hashId])

  const managePlay = useCallback(
    (state: boolean) => {
      setPlayState(state)
    },
    [hashId]
  )

  useEffect(() => {
    if (pattern[tick]) {
      bridge.send('VKWebAppFlashSetLevel', { level: 1.0 })
    } else {
      bridge.send('VKWebAppFlashSetLevel', { level: 0 })
    }
  }, [pattern, tick])

  const reset = useCallback(() => {
    setPattern(initialPattern)
    setPlayState(false)
    setTick(0)
    bridge.send('VKWebAppFlashSetLevel', { level: 0 })
  }, [])

  useEffect(() => {
    if (hashId) {
      sock.emit(
        'update',
        fetchedUser?.id,
        hashId,
        JSON.stringify(pattern) || ''
      )
    }
  }, [pattern, hashId, fetchedUser])

  useEffect(() => {
    if (fetchedUser && fetchedUser.id) {
      sock.emit('create', fetchedUser.id, JSON.stringify(pattern) || '')
    }
  }, [fetchedUser])

  const onCreate = useCallback((hash: string) => {
    setHashId(hash)
  }, [])

  useEffect(() => {
    sock.on('beat-created', onCreate)
    return () => {
      sock.off('beat-created', onCreate)
    }
  }, [])

  return (
    <>
      <PanelHeader
        left={
          <IconButton onClick={() => props.go('join')}>
            <WifiIcon className='w-6 h-6 mx-3' />
          </IconButton>
        }
      >
        Create Loop
      </PanelHeader>
      <Group>
        <Div>
          <Button
            mode={!playState ? 'commerce' : 'destructive'}
            style={{ width: 'calc(70%)' }}
            onClick={() => managePlay(!playState)}
            size={'m'}
          >
            {!playState ? 'Play!' : 'Stop'}
          </Button>
          <Button
            mode={'secondary'}
            style={{ width: 'calc(30% - 16px)', marginLeft: '16px' }}
            onClick={() => reset()}
            size={'m'}
          >
            Reset
          </Button>
        </Div>
        <Div className={'flex flex-row items-center justify-center'}>
          {pattern.map((v, i) => (
            <Button
              key={i}
              mode={v ? 'commerce' : 'secondary'}
              onClick={() =>
                setPattern((m) => m.map((v, ind) => (i === ind ? !v : v)))
              }
              style={{ marginLeft: '4px', marginRight: '4px' }}
              size={'s'}
              className={`${tick === i ? 'ring-1 ring-blue-400' : ''}`}
            >
              {v ? '+' : '-'}
            </Button>
          ))}
        </Div>

        <Group
          header={<Header mode='secondary'>Пригласите друзей в бит</Header>}
          className={'flex flex-col items-center justify-center'}
        >
          <Input
            value={hashId || 'Паттерн создается...'}
            readOnly={true}
            className={'text-center'}
          />
        </Group>
      </Group>
    </>
  )
}
