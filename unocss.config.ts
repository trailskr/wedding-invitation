import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      include: /\.(vue|ts|html)($|\?)/,
    },
  },
  theme: {
    colors: {
      'lavender': '#b2a4d4',
      'text': '#635f6d',
      'dark-text': '#3d3b42',
      'base': '#d0c5e9',
    },
  },
  presets: [
    presetWind3(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Bellota',
        artistic: 'Great Vibes',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: 'prose'.split(' '),
})
