import type { Categoria, Servico } from './tipos'
import { diasDesde, PRAZO_CONFERENCIA_DIAS } from '../utils/formatar'

export type Filtros = {
  categoria: Categoria | null
  raioM: number
  abertoAgora: boolean
  soConferidos: boolean
}

export function foiConferido(servico: Servico) {
  const data = servico.ultima_verificacao_em
  return data !== null && diasDesde(data) <= PRAZO_CONFERENCIA_DIAS
}

export function filtrarServicos(servicos: Servico[], filtros: Filtros) {
  return servicos
    .filter((s) => filtros.categoria === null || s.categoria === filtros.categoria)
    .filter((s) => s.distancia_m <= filtros.raioM)
    .filter((s) => !filtros.abertoAgora || s.aberto_agora)
    .filter((s) => !filtros.soConferidos || foiConferido(s))
    .sort((a, b) => a.distancia_m - b.distancia_m)
}