import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './js/pages/app.jsx'

render(<AppContainer><App /></AppContainer>, document.querySelector('#app'))

if (module && module.hot) {
  module.hot.accept('./js/pages/app.jsx', () => {
    const App = require('./js/pages/app.jsx').default
    render(
      <AppContainer>
        <App />
      </AppContainer>,
      document.querySelector('#app')
    )
  })
}
