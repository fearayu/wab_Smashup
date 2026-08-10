import type { App } from 'vue'

import { setupLayouts } from 'virtual:generated-layouts'
import type { RouteRecordRaw } from 'vue-router/auto'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { useAuthStore } from '@/stores/use-auth-store'

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])

    return route
  }

  return setupLayouts([route])[0]
}

// Pages that do NOT require authentication
const PUBLIC_PAGES = new Set([
  'root',       // home
  'login',      // login/register
  'demo',       // demo booking
  'book-slug',  // public booking page
  'buffet',     // public buffet page
  'gang',       // public gang page
  'food',       // public food page
  '[...error]', // error page
])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages].map(route => recursiveLayouts(route)),
  ],
})

// Navigation guard — redirect unauthenticated users to login
router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()

  // Init auth on first navigation (restore token from localStorage)
  if (!authStore._initialized) {
    authStore._initialized = true
    authStore.init()
  }

  // Allow all pages for now (including protected ones)
  // Protected pages: dashboard, admin-roles, user-page, onboarding
  const PROTECTED_PAGES = new Set([
    'dashboard',
    'admin-roles',
    'user-page',
    'onboarding',
  ])

  const routeName = (to.name as string) || ''

  if (PROTECTED_PAGES.has(routeName) && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export { router }

export default function (app: App) {
  app.use(router)
}
