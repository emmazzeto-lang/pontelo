import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// As fontes do texto e dos títulos começam a baixar junto com a página, e não só depois do CSS.
// Sem isso, o texto aparece com a fonte do sistema e "pula" quando a fonte certa chega.
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
})
