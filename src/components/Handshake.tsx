import { Card, CardGrid } from '@vkontakte/vkui'
import { ReactComponent as Hand } from '../assets/hand.svg'
import './Handshake.css'

export const Handshake = ({ active }: { active: boolean }) => {
  return (
    <CardGrid size='l' className='mt-4'>
      <Card>
        <div
          className='w-full flex items-center justify-center'
          style={{ height: '40vh' }}
        >
          <Hand
            className={`w-32 transition-all ${active ? 'hand-left' : ''}`}
          />
          <Hand
            className={`w-32 transition-all ${
              active ? 'hand-right' : 'hidden'
            }`}
          />
        </div>
      </Card>
    </CardGrid>
  )
}
