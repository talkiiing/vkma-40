import {
  Button,
  Group,
  Placeholder,
  Separator,
  Div,
  Header,
  SimpleCell,
  IconButton,
  PullToRefresh,
} from '@vkontakte/vkui'
import { Icon16Delete, Icon24Qr, Icon28QrCodeOutline } from '@vkontakte/icons'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import bridge from '@vkontakte/vk-bridge'
import { useCallback, useMemo } from 'react'
import { QrcodeIcon, ShareIcon, TrashIcon } from '@heroicons/react/outline'
import useCached from '../utils/useCached'
import { QR } from '../utils/models/General.model'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'
import { shareStory } from '../utils/shareStory'

export interface HistoryProps extends GoInterface {
  fetchItems: CallableFunction
}

export const HistoryList = (props: HistoryProps) => {
  const { data: qrList, setData: setQrList } = useCached<QR[]>('qr_history')

  const handleScan = useCallback(async () => {
    const result = await bridge.send('VKWebAppOpenCodeReader')
    setQrList([
      ...qrList,
      {
        data: result.code_data,
        scanDate: DateTime.now().toMillis(),
        hash: nanoid(15),
      } as QR,
    ])
  }, [qrList])

  const deleteQr = useCallback(
    (hash: QR['hash']) => {
      setQrList(qrList.filter((v) => v.hash !== hash))
    },
    [qrList]
  )

  const motivationPhrase = useMemo(() => {
    const l = (qrList && qrList.length) || 0
    if (!l) return ''
    const template =
      l < 3
        ? 'Неплохое начало, уже {0} QR!'
        : l < 5
        ? 'У Вас уже {0} QR! Так держать!'
        : l < 10
        ? 'Да Вы начинающий коллекционер! {0} QR! ОГО!'
        : l < 20
        ? 'Какая шикарная коллекция... {0} QR!'
        : 'Вот Ваши дорогие {0} QR!'
    return template.replace('{0}', l.toString(10))
  }, [qrList])

  const historyComputed = useMemo(
    () => (
      <>
        {qrList &&
          qrList.map((v) => {
            return (
              <SimpleCell
                after={
                  <>
                    <IconButton
                      aria-label='Поделиться'
                      onClick={() => shareStory(v)}
                    >
                      <ShareIcon className='w-6 h-6 mx-3' />
                    </IconButton>
                    <IconButton
                      aria-label='Удалить'
                      onClick={() => deleteQr(v.hash)}
                    >
                      <TrashIcon className='w-6 h-6 mx-3' />
                    </IconButton>
                  </>
                }
                description={v.data}
              >
                {DateTime.fromMillis(v.scanDate)
                  .setLocale('ru')
                  .toFormat("'Создано' dd MMM 'в' HH:mm")}
              </SimpleCell>
            )
          })}
      </>
    ),
    [qrList]
  )

  return (
    <>
      <Group>
        <Placeholder
          icon={<Icon28QrCodeOutline />}
          header='Ваше QR хранилище'
          action={
            <Button
              size='m'
              onClick={() => handleScan()}
              before={<Icon24Qr className='h-4 w-4' />}
              mode='outline'
            >
              Сканировать
            </Button>
          }
        >
          {motivationPhrase}
        </Placeholder>
      </Group>

      <Group header={<Header>История сканирования</Header>}>
        {historyComputed}
      </Group>
    </>
  )
}
