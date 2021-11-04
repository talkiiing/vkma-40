import {
  Button,
  Group,
  Placeholder,
  Separator,
  Div,
  Header,
  SimpleCell,
  IconButton,
  PanelHeader,
  PullToRefresh,
  DatePicker,
  FormItem,
  Input,
  CardScroll,
  Card,
  Tabs,
  TabsItem,
} from '@vkontakte/vkui'
import { Icon16Delete, Icon24Qr, Icon28QrCodeOutline } from '@vkontakte/icons'
import { GoInterface } from '../utils/interfaceInjections/go.interface'
import bridge from '@vkontakte/vk-bridge'
import { Component, ReactNode, useCallback, useMemo, useState } from 'react'
import {
  ArchiveIcon,
  BeakerIcon,
  CalculatorIcon,
  LinkIcon,
  QrcodeIcon,
  TrashIcon,
} from '@heroicons/react/outline'
import useCached from '../utils/useCached'
import { QR } from '../utils/models/General.model'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'
import { ReNumber, ReURL } from '../utils/regexps'

export interface CollectionsProps extends GoInterface {
  fetchItems: CallableFunction
}

type TabsValues = 'links' | 'digits' | 'other'

export const Collections = (props: CollectionsProps) => {
  const { data: qrList, setData: setQrList } = useCached<QR[]>('qr_history')

  const [currentTab, setCurrentTab] = useState<TabsValues>('links')

  const deleteQr = useCallback(
    (hash: QR['hash']) => {
      setQrList(qrList.filter((v) => v.hash !== hash))
    },
    [qrList]
  )

  const grouped = useMemo(
    (): Record<TabsValues, QR[]> =>
      qrList.reduce(
        (a, v) => {
          const cat: TabsValues = ReURL.test(v.data)
            ? 'links'
            : ReNumber.test(v.data)
            ? 'digits'
            : 'other'
          return { ...a, [cat]: [...a[cat], v] }
        },
        {
          links: [],
          digits: [],
          other: [],
        } as Record<TabsValues, QR[]>
      ),
    [qrList]
  )

  const drawGroup = useCallback(
    (group: TabsValues): JSX.Element => {
      return (
        <>
          {grouped &&
            grouped[group] &&
            grouped[group].map((v) => {
              return (
                <SimpleCell
                  after={
                    <IconButton
                      aria-label='Удалить'
                      onClick={() => deleteQr(v.hash)}
                    >
                      <TrashIcon className='w-6 h-6 mx-3' />
                    </IconButton>
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
      )
    },
    [qrList]
  )

  return (
    <>
      <PanelHeader
        left={
          <IconButton aria-label='Сканировать' onClick={() => props.go('main')}>
            <QrcodeIcon className='w-6 h-6 mx-3' />
          </IconButton>
        }
      >
        Коллекции
      </PanelHeader>
      <PullToRefresh onRefresh={() => props.fetchItems()}>
        <Group>
          <Tabs>
            <TabsItem
              onClick={() => setCurrentTab('links')}
              selected={currentTab === 'links'}
            >
              <div className='flex space-x-2 items-center justify-center'>
                <LinkIcon className='w-4 h-4' />
                <span>Ссылки</span>
              </div>
            </TabsItem>
            <TabsItem
              onClick={() => setCurrentTab('digits')}
              selected={currentTab === 'digits'}
            >
              <div className='flex space-x-2 items-center justify-center'>
                <CalculatorIcon className='w-4 h-4' />
                <span>Цифры</span>
              </div>
            </TabsItem>
            <TabsItem
              onClick={() => setCurrentTab('other')}
              selected={currentTab === 'other'}
            >
              <div className='flex space-x-2 items-center justify-center'>
                <BeakerIcon className='w-4 h-4' />
                <span>Другое</span>
              </div>
            </TabsItem>
          </Tabs>
          {drawGroup(currentTab)}
        </Group>
      </PullToRefresh>
    </>
  )
}
