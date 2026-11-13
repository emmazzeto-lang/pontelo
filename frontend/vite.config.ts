import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const FONTES_PRINCIPAIS = ['inter-latin-400-normal', 'nunito-latin-800-normal']

function preCarregarFontes(): Plugin {
  return {
    name: 'pre-carregar-fontes',
    apply: 'build',
    transformIndexHtml(_html, contexto) {
      const arquivos = Object.keys(contexto.bundle ?? {}).filter(
        (nome) => nome.endsWith('.woff2') && FONTES_PRINCIPAIS.some((fonte) => nome.includes(fonte)),
      )
      return arquivos.map((arquivo) => ({
        tag: 'link',
        attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${arquivo}`, crossorigin: '' },
        injectTo: 'head' as const,
      }))
    },
  }
}

export default defineConfig({
  envDir: '..',
  plugins: [react(), tailwindcss(), preCarregarFontes()],
  build: {
    rollupOptions: {
      input: {
        pontelo: resolve(import.meta.dirname, 'index.html'),
        calculadora: resolve(import.meta.dirname, 'calculadora.html'),
      },
    },
  },
})
