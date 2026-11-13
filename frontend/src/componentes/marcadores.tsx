import L from 'leaflet'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import Icone, { type NomeIcone } from './Icone'
import { categorias } from '../dados/categorias'
import { cores } from '../estilos/cores'
import type { Categoria } from '../servicos/tipos'

function desenharIcone(nome: NomeIcone) {
  const div = document.createElement('div')
  const raiz = createRoot(div)
  flushSync(() => {
    raiz.render(<Icone nome={nome} tamanho={20} cor={cores.branco} destaque={cores.dourado} />)
  })
  const html = div.innerHTML
  raiz.unmount()
  return html
}

function criarMarcador(nome: NomeIcone) {
  return L.divIcon({
    className: 'marcador-servico',
    html: desenharIcone(nome),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  })
}

// Criados uma vez só, quando o mapa é carregado
export const marcadorPorCategoria = Object.fromEntries(
  categorias.map((c) => [c.slug, criarMarcador(c.icone)]),
) as Record<Categoria, L.DivIcon>