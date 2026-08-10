import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.stories.@(ts|tsx|js|jsx|mdx)',
    '../src/components/**/*.stories.@(ts|tsx|js|jsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async baseConfig => {
    return mergeConfig(baseConfig, {
      define: { 'process.env': {} },
      plugins: [
        vuetify({
          styles: {
            configFile: 'src/assets/styles/variables/_vuetify.scss',
          },
        }),
      ],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
          '@themeConfig': fileURLToPath(new URL('../themeConfig.ts', import.meta.url)),
          '@core': fileURLToPath(new URL('../src/@core', import.meta.url)),
          '@layouts': fileURLToPath(new URL('../src/@layouts', import.meta.url)),
          '@images': fileURLToPath(new URL('../src/assets/images/', import.meta.url)),
          '@styles': fileURLToPath(new URL('../src/assets/styles/', import.meta.url)),
          '@configured-variables': fileURLToPath(
            new URL('../src/assets/styles/variables/_template.scss', import.meta.url),
          ),
          '@db': fileURLToPath(new URL('../src/plugins/fake-api/handlers/', import.meta.url)),
          '@api-utils': fileURLToPath(new URL('../src/plugins/fake-api/utils/', import.meta.url)),
        },
      },
    })
  },
}

export default config
