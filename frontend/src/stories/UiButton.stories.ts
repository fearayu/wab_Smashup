// @ts-expect-error: Storybook specific types
import type { Meta, StoryObj } from '@storybook/vue3'
import UiButton from '@/components/ui/UiButton.vue'

const meta: Meta<typeof UiButton> = {
  title: 'Components/UiButton',
  component: UiButton,
  args: {
    tone: 'primary',
    size: 'md',
    block: false,
    loading: false,
    disabled: false,
  },
}

export default meta

type Story = StoryObj<typeof UiButton>

export const Primary: Story = {
  args: {
    tone: 'primary',
  },
  render: (args: any) => ({
    components: { UiButton },
    setup() {
      return { args }
    },
    template: '<UiButton v-bind="args">Primary Action</UiButton>',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UiButton },
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        <UiButton tone="primary">Primary</UiButton>
        <UiButton tone="secondary">Secondary</UiButton>
        <UiButton tone="outline">Outline</UiButton>
        <UiButton tone="ghost">Ghost</UiButton>
        <UiButton tone="success">Success</UiButton>
        <UiButton tone="danger">Danger</UiButton>
      </div>
    `,
  }),
}
