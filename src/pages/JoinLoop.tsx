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
  Input,
  Header,
  IconButton,
} from '@vkontakte/vkui'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import { useCallback, useEffect, useMemo, useState } from 'react'
import bridge from '@vkontakte/vk-bridge'
import useInput from '../utils/useInput'
import sock from '../utils/service/sock.service'
import { PlusIcon, WifiIcon } from '@heroicons/react/outline'
import { DateTime } from 'luxon'

export interface JoinLoopProps extends GoInterface {
  setLoading: (state: boolean) => void
}

export const JoinLoop = (props: JoinLoopProps) => {
  const inputModel = useInput('')

  const [mode, setMode] = useState<'join' | 'listen'>('join')

  const [beat, setBeat] = useState<boolean[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [tick, setTick] = useState<number>(0)

  const playing = useMemo(() => {
    setTick(
      startTime
        ? Math.floor(
            8 -
              DateTime.now()
                .minus({
                  milliseconds: startTime || 0,
                })
                .toSeconds()
          ) % 8
        : 0
    )
    console.log(
      Math.floor(
        DateTime.now()
          .minus({
            seconds: Math.floor(
              DateTime.fromMillis(startTime || 0).toSeconds()
            ),
          })
          .toSeconds()
      ) % 8
    )
    return !!startTime
  }, [startTime])

  useEffect(() => {
    if (playing) {
      let inter = setInterval(() => setTick((t) => (t + 1) % 8), 1000)
      return () => clearInterval(inter)
    }
  }, [playing])

  const updateH = useCallback((p: { beat: boolean[] }) => {
    setBeat(p.beat)
    //console.log(p)
  }, [])

  const startH = useCallback(
    (p: { beat: boolean[]; creator: any; start: number }) => {
      setStartTime(p.start)
      //console.log(p)
    },
    []
  )

  const stopH = useCallback((p: { beat: boolean[]; creator: any }) => {
    setStartTime(null)
    //console.log(p)
  }, [])

  const beatH = useCallback(
    (p: { beat: boolean[]; creator: any; start?: number }) => {
      const { beat: fb } = p //JSON.parse(p)
      setBeat(fb)
      if (p.start) {
        setStartTime(p.start)
      }
      //console.log(p)
    },
    []
  )

  useEffect(() => {
    sock.on('beat-updated', updateH)
    return () => {
      sock.off('beat-updated', updateH)
    }
  }, [updateH])

  useEffect(() => {
    sock.on('beat', beatH)
    return () => {
      sock.off('beat', beatH)
    }
  }, [beatH])

  useEffect(() => {
    sock.on('beat-started', startH)
    return () => {
      sock.off('beat-started', startH)
    }
  }, [startH])

  useEffect(() => {
    sock.on('beat-stopped', stopH)
    return () => {
      sock.off('beat-stopped', stopH)
    }
  }, [stopH])

  const tryToListen = useCallback(() => {
    sock.emit('get', inputModel.value)
  }, [inputModel.value])

  useEffect(() => {
    if (beat[tick]) {
      bridge.send('VKWebAppFlashSetLevel', { level: 1.0 })
    } else {
      bridge.send('VKWebAppFlashSetLevel', { level: 0 })
    }
  }, [tick])

  return (
    <>
      <PanelHeader
        left={
          <IconButton onClick={() => props.go('create')}>
            <PlusIcon className='w-6 h-6 mx-3' />
          </IconButton>
        }
      >
        Join Loop
      </PanelHeader>
      <Group header={<Header mode='secondary'>Введите код бита</Header>}>
        <Div>
          <Input
            value={inputModel.bind.value}
            onChange={inputModel.bind.onChange}
            className='mb-4'
          />
          <Button onClick={() => tryToListen()} size='l' stretched>
            Подключиться
          </Button>
        </Div>
      </Group>
      <Group header={<Header mode='secondary'>Бит {tick}</Header>}>
        <Div>
          <div className='flex space-x-1 items-center'>
            {beat.map((v, i) => (
              <div
                className={`w-4 h-4 rounded-full ring-1 ring-black ${
                  tick === i ? 'bg-blue-500' : v ? 'bg-black' : ''
                }`}
              >
                {' '}
              </div>
            ))}
          </div>
        </Div>
      </Group>
    </>
  )
}
//65fc2e89e78de8e91022
