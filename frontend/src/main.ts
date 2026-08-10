import { createApp } from 'vue'

import { registerPlugins } from '@core/utils/plugins'
import App from '@/App.vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
