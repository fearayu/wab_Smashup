// @ts-expect-error: Storybook specific types
import type { Meta, StoryObj } from '@storybook/vue3'
import UiStatCard from '@/components/ui/UiStatCard.vue'

const meta: Meta<typeof UiStatCard> = {
  title: 'Components/UiStatCard',
  component: UiStatCard,
}

export default meta

type Story = StoryObj<typeof UiStatCard>

export const Overview: Story = {
  render: () => ({
    components: { UiStatCard },
    template: `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:16px;">
        <UiStatCard label="Active Users" :value="12840" trend="up" delta="12.4%" helper="vs last week" />
        <UiStatCard label="Churn Rate" value="2.1%" trend="down" delta="0.4%" helper="last 30 days" />
        <UiStatCard label="MRR" value="$84,200" trend="up" delta="7.8%" helper="monthly recurring" />
      </div>
    `,
  }),
}
