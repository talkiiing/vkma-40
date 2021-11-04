import { QR } from './models/General.model'
import bridge from '@vkontakte/vk-bridge'

export const shareStory = (v: QR): void => {
  bridge.send('VKWebAppShowStoryBox', {
    background_type: 'image',
    url: 'https://sun9-65.userapi.com/c850136/v850136098/1b77eb/0YK6suXkY24.jpg',
    stickers: [
      {
        sticker_type: 'renderable',
        sticker: {
          content_type: 'image',
          url: `https://textoverimage.moesif.com/image?image_url=https%3A%2F%2Fstatic.talkiiing.ru%2Fvzdkd%2Fbackfold.png&text=${encodeURIComponent(
            v.data
          )}&text_color=000000ff&text_size=16&margin=40&y_align=bottom&x_align=center`,
          clickable_zones: [
            {
              action_type: 'link',
              action: {
                link: 'https://vk.com/app7993342',
                tooltip_text_key: 'tooltip_open_default',
              },
              clickable_area: [
                {
                  x: 0,
                  y: 0,
                },

                {
                  x: 400,
                  y: 0,
                },

                {
                  x: 400,
                  y: 90,
                },

                {
                  x: 0,
                  y: 90,
                },
              ],
            },
          ],
        },
      },
      {
        sticker_type: 'renderable',
        sticker: {
          content_type: 'image',
          url: `https://static.talkiiing.ru/vzdkd/backfold.png`,
          clickable_zones: [
            {
              action_type: 'link',
              action: {
                link: 'https://vk.com/app7993342',
                tooltip_text_key: 'tooltip_open_default',
              },
              clickable_area: [
                {
                  x: 0,
                  y: 0,
                },

                {
                  x: 400,
                  y: 0,
                },

                {
                  x: 400,
                  y: 90,
                },

                {
                  x: 0,
                  y: 90,
                },
              ],
            },
          ],
        },
      },
      {
        sticker_type: 'renderable',
        sticker: {
          content_type: 'image',
          url: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
            v.data
          )}&qzone=2&format=jpg`,
          clickable_zones: [
            {
              action_type: 'link',
              action: {
                link: 'https://vk.com/app7993342',
                tooltip_text_key: 'tooltip_open_default',
              },
              clickable_area: [
                {
                  x: 0,
                  y: 0,
                },

                {
                  x: 400,
                  y: 0,
                },

                {
                  x: 400,
                  y: 400,
                },

                {
                  x: 0,
                  y: 400,
                },
              ],
            },
          ],
        },
      },
    ],
  })
}
