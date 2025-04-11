import type { UserModule } from './UserModule'
import { createHead } from '@unhead/vue/client'

export const head = createHead()

export const install: UserModule = ({ app }) => {
  app.use(head)
}
