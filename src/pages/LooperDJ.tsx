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
} from '@vkontakte/vkui'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import { useCallback, useEffect, useMemo, useState } from 'react'
import bridge from '@vkontakte/vk-bridge'

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

  useEffect(() => {
    if (playState) {
      let timer = setInterval(doTick, 1000)
      return () => clearInterval(timer)
    }
  }, [playState])

  const doTick = useCallback(async () => {
    playState && setTick((t) => (t + 1) % ticks)
  }, [playState])

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

  return (
    <>
      <PanelHeader>Flashlight-beat</PanelHeader>
      <Group>
        <Div>
          <Button
            mode={!playState ? 'commerce' : 'destructive'}
            style={{ width: 'calc(70%)' }}
            onClick={() => setPlayState((s) => !s)}
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
        <Div className={'flex flex-row items-center'}>
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
      </Group>
    </>
  )
}
