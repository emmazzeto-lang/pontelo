import { Outlet } from 'react-router'
import BarraEmergencia from './BarraEmergencia'
import Cabecalho from './Cabecalho'
import Rodape from './Rodape'
import { useAtalhoSaidaRapida } from '../hooks/useSaidaRapida'

export default function Layout() {
  useAtalhoSaidaRapida()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
      >
        Pular para o conteúdo
      </a>

      <BarraEmergencia />
      <Cabecalho />

      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>

      <Rodape />
    </div>
  )
}