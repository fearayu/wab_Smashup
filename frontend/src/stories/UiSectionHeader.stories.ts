// @ts-expect-error: Storybook specific types
import type { Meta, StoryObj } from '@storybook/vue3'
import UiSectionHeader from '@/components/ui/UiSectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'

const meta: Meta<typeof UiSectionHeader> = {
  title: 'Components/UiSectionHeader',
  component: UiSectionHeader,
}

export default meta

type Story = StoryObj<typeof UiSectionHeader>

export const WithActions: Story = {
  render: () => ({
    components: { UiSectionHeader, UiButton },
    template: `
      <UiSectionHeader title="Team Activity" subtitle="Updated a few seconds ago">
        <template #actions>
          <UiButton tone="secondary" size="sm">Filters</UiButton>
          <UiButton tone="primary" size="sm">New report</UiButton>
        </template>
      </UiSectionHeader>
    `,
  }),
}

export const Centered: Story = {
  render: () => ({
    components: { UiSectionHeader },
    template: `
      <UiSectionHeader title="Billing Overview" subtitle="Focus on retention trends" align="center" />
    `,
  }),
}
