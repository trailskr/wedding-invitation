import { fileURLToPath, URL } from 'node:url'
import { unheadVueComposablesImports } from '@unhead/vue'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import vueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import layouts from 'vite-plugin-vue-layouts'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    // https://github.com/posva/unplugin-vue-router
    vueRouter({
      dts: 'src/typed-router.d.ts',
    }),

    // ⚠️ Vue must be placed after VueRouter()
    vue(),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    layouts(),

    // https://github.com/antfu/unplugin-auto-import
    autoImport({
      imports: [
        'vue',
        '@vueuse/core',
        'vitest',
        VueRouterAutoImports,
        unheadVueComposablesImports,
        {
          from: 'neverthrow',
          imports: [
            'Err',
            'Ok',
            { name: 'Result', type: true },
            'ResultAsync',
            'err',
            'errAsync',
            'fromAsyncThrowable',
            'fromPromise',
            'fromSafePromise',
            'fromThrowable',
            'ok',
            'okAsync',
            'safeTry',
          ],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: [
        'src/composables',
        'src/lib',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    components({
      include: [/\.vue$/, /\.vue\?vue/],
      dirs: [
        'src/components',
        'src/components-story',
      ],
      dts: 'src/components.d.ts',
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    unocss(),

    // https://github.com/webfansplz/vite-plugin-vue-devtools
    vueDevTools(),
  ],
})
