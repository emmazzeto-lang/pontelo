import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErroApi, restaurarSessao } from './servicos/api'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import './estilos/global.css'

import App from './App'

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // Tenta mais uma vez em falha de rede, mas não insiste em "não encontrado"
      retry: (tentativas, erro) => {
        const erroDoPedido = erro instanceof ErroApi && erro.status >= 400 && erro.status < 500
        return !erroDoPedido && tentativas < 1
      },
    },
  },
})

// Fora de componente: roda uma vez só, mesmo no StrictMode (que monta tudo duas vezes)
restaurarSessao()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <QueryClientProvider client={clienteConsultas}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
</StrictMode>,
)