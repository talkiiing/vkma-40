import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import '@vkontakte/vkui/dist/vkui.css'
import App from './App'
import { Provider } from 'react-redux'
import store from './store/store'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'
import bridge from '@vkontakte/vk-bridge'

// Отправляет событие нативному клиенту на инициализацию приложения
bridge.send('VKWebAppInit', {})

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <Provider store={store}>
            <App />
          </Provider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

import('./eruda').then(({ default: eruda }) => {}) //runtime download
