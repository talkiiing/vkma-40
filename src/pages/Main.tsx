import {
  Button,
  Group,
  Header,
  IconButton,
  PanelHeader,
  PanelHeaderBack,
  PanelHeaderButton,
  Placeholder,
  PullToRefresh,
  Separator,
  SimpleCell,
} from '@vkontakte/vkui'
import { GoFn, QR } from '../utils/models/General.model'
import { Icon28QrCodeOutline, Icon56MentionOutline } from '@vkontakte/icons'
import { ArchiveIcon, TrashIcon } from '@heroicons/react/outline'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import useCached from '../utils/useCached'
import { CreateFirst } from './CreateFirst'
import { HistoryList } from './HistoryList'
import { useEffect, useMemo } from 'react'

export interface MainProps extends GoInterface {
  setLoading: (state: boolean) => void
  fetchItems: CallableFunction
}

export const Main = (props: MainProps) => {
  const { data: qrList } = useCached('qr_history', async () => [])

  useEffect(() => {
    console.log('list changed', qrList)
  }, [qrList])

  return (
    <>
      <PanelHeader
        left={
          <IconButton
            aria-label='Коллекции'
            onClick={() => props.go('collections')}
          >
            <ArchiveIcon className='w-6 h-6 mx-3' />
          </IconButton>
        }
      >
        Сканер
      </PanelHeader>
      <PullToRefresh onRefresh={() => props.fetchItems()}>
        {qrList && qrList.length ? (
          <HistoryList go={props.go} fetchItems={props.fetchItems} />
        ) : (
          <CreateFirst go={props.go} />
        )}
      </PullToRefresh>
    </>
  )
}
