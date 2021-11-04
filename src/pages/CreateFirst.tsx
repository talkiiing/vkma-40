import { Button, Group, Placeholder, Separator } from '@vkontakte/vkui'
import { Icon28QrCodeOutline } from '@vkontakte/icons'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import { useCallback } from 'react'
import bridge from '@vkontakte/vk-bridge'
import useCached from '../utils/useCached'
import { QR } from '../utils/models/General.model'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'

export interface CreateFirstProps extends GoInterface {}

export const CreateFirst = (props: CreateFirstProps) => {
  const { data: qrList, setData: setQrList } = useCached<QR[]>(
    'qr_history',
    async () => []
  )

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

  return (
    <Group>
      <Placeholder
        icon={<Icon28QrCodeOutline />}
        header='Ваше QR хранилище'
        action={
          <Button size='m' onClick={() => handleScan()}>
            Отсканировать первый
          </Button>
        }
      >
        Здесь нет ни одного QR-кода, но Вы можете
      </Placeholder>
    </Group>
  )
}
