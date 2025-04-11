import type { UserModule, UserModuleContext } from './modules/UserModule'

import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

export const app = createApp(App)

const router = createRouter({
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { left: 0, top: 0 },
  routes: setupLayouts(routes),
  history: createWebHistory(import.meta.env.BASE_URL),
})

app.use(router)

const ctx: UserModuleContext = { app }

Object.values(
  import.meta.glob<{ install: UserModule }>(
    './modules/*.ts',
    { eager: true },
  ),
).forEach((module) => module.install?.(ctx))

app.mount('#app')
