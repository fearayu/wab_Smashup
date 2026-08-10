// @ts-expect-error: Storybook specific types
import type { Meta, StoryObj } from '@storybook/vue3'
import UiBadge from '@/components/ui/UiBadge.vue'

const meta: Meta<typeof UiBadge> = {
  title: 'Components/UiBadge',
  component: UiBadge,
}

export default meta

type Story = StoryObj<typeof UiBadge>

export const Tones: Story = {
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <UiBadge tone="neutral">Neutral</UiBadge>
        <UiBadge tone="primary">Primary</UiBadge>
        <UiBadge tone="secondary">Secondary</UiBadge>
        <UiBadge tone="info">Info</UiBadge>
        <UiBadge tone="success">Success</UiBadge>
        <UiBadge tone="warning">Warning</UiBadge>
        <UiBadge tone="danger">Danger</UiBadge>
      </div>
    `,
  }),
}

export const Pill: Story = {
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display:flex; gap:10px;">
        <UiBadge tone="primary" pill>New</UiBadge>
        <UiBadge tone="success" pill>Live</UiBadge>
      </div>
    `,
  }),
}
