// @ts-expect-error: Storybook specific types
import type { Meta, StoryObj } from '@storybook/vue3'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'

const meta: Meta<typeof UiCard> = {
  title: 'Components/UiCard',
  component: UiCard,
}

export default meta

type Story = StoryObj<typeof UiCard>

export const Default: Story = {
  render: () => ({
    components: { UiCard, UiButton },
    template: `
      <UiCard title="Usage Snapshot" subtitle="Last 7 days" divider>
        <p style="margin:0; color:var(--color-text-muted);">
          1,482 API calls processed. Performance is within SLA and error rate is below 0.3%.
        </p>
        <template #actions>
          <UiButton tone="secondary" size="sm">View details</UiButton>
          <UiButton tone="primary" size="sm">Export</UiButton>
        </template>
      </UiCard>
    `,
  }),
}

export const Subtle: Story = {
  render: () => ({
    components: { UiCard },
    template: `
      <UiCard tone="subtle" padding="lg">
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="font-weight:600;">Subtle Surface</div>
          <div style="color:var(--color-text-muted);">Great for inline widgets or side panels.</div>
        </div>
      </UiCard>
    `,
  }),
}
