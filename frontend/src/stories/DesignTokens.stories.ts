// @ts-expect-error: Storybook specific types
import type { Meta, StoryObj } from '@storybook/vue3'
import { tokens } from '@/design-tokens/tokens'

const meta: Meta = {
  title: 'Foundations/Design Tokens',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj

export const Overview: Story = {
  render: () => ({
    setup() {
      return { tokens }
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:32px;">
        <section>
          <h2 style="font-size:var(--text-xl); margin-bottom:12px;">Brand & Semantic</h2>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:12px;">
            <div v-for="(value, key) in tokens.color.brand" :key="key" style="padding:12px; border-radius:12px; border:1px solid var(--color-border);">
              <div :style="{ background: value, height: '56px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)' }"></div>
              <div style="margin-top:8px; font-weight:600;">{{ key }}</div>
              <div style="color:var(--color-text-muted); font-size:var(--text-sm);">{{ value }}</div>
            </div>
            <div v-for="(value, key) in tokens.color.semantic" :key="'sem-' + key" style="padding:12px; border-radius:12px; border:1px solid var(--color-border);">
              <div :style="{ background: value, height: '56px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)' }"></div>
              <div style="margin-top:8px; font-weight:600;">{{ key }}</div>
              <div style="color:var(--color-text-muted); font-size:var(--text-sm);">{{ value }}</div>
            </div>
          </div>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); margin-bottom:12px;">Typography</h2>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
            <div v-for="(value, key) in tokens.typography.fontSize" :key="key" style="padding:12px; border-radius:12px; border:1px solid var(--color-border);">
              <div :style="{ fontSize: value, fontWeight: tokens.typography.fontWeight.semibold }">
                {{ key }} — {{ value }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); margin-bottom:12px;">Spacing & Radius</h2>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
            <div v-for="(value, key) in tokens.spacing" :key="key" style="padding:12px; border-radius:12px; border:1px solid var(--color-border);">
              <div style="font-weight:600;">{{ key }} — {{ value }}</div>
              <div :style="{ height: '10px', marginTop: '8px', background: 'var(--color-brand-primary)', width: value, borderRadius: '8px' }"></div>
            </div>
            <div v-for="(value, key) in tokens.radius" :key="'radius-' + key" style="padding:12px; border-radius:12px; border:1px solid var(--color-border);">
              <div style="font-weight:600;">{{ key }} — {{ value }}</div>
              <div :style="{ height: '40px', marginTop: '8px', background: 'var(--color-surface-muted)', borderRadius: value, border: '1px solid var(--color-border)' }"></div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
