import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import defaults from '../src/plugins/vuetify/defaults'
import { icons } from '../src/plugins/vuetify/icons'
import { themes } from '../src/plugins/vuetify/theme'

import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import '@styles/storybook.scss'
import 'vuetify/styles'

const vuetify = createVuetify({
  components,
  directives,
  defaults,
  icons,
  theme: {
    defaultTheme: 'light',
    themes,
  },
})

setup(app => {
  app.use(vuetify)
})

const preview: Preview = {
  decorators: [
    () => ({
      template: '<v-app><v-main class="sb-main"><story /></v-main></v-app>',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
