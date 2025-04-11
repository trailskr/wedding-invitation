import type { App } from 'vue'

export type UserModuleContext = {
  readonly app: App
}

export type UserModule = (params: UserModuleContext) => void
