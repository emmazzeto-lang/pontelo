import type { Servico } from '../servicos/tipos'

// Dados fictícios, só para montar as telas antes da API ficar pronta
const UM_DIA_MS = 24 * 60 * 60 * 1000
const diasAtras = (dias: number) => new Date(Date.now() - dias * UM_DIA_MS).toISOString()

export const servicosExemplo: Servico[] = [
  {
    id: '1',
    nome: 'Cozinha Comunitária Esperança',
    categoria: 'refeicao',
    distancia_m: 847,
    aberto_agora: true,
    horario_hoje: 'fecha às 14h',
    endereco: 'Rua das Flores, 120 · Centro',
    telefone: '1133330000',
    ultima_verificacao_em: diasAtras(12),
    localizacao: { lat: -23.556, lng: -46.639 },
  },
  {
    id: '2',
    nome: 'Refeitório Solidário São José',
    categoria: 'refeicao',
    distancia_m: 1240,
    aberto_agora: true,
    horario_hoje: 'fecha às 15h',
    endereco: 'Av. Brasil, 845 · Bela Vista',
    telefone: '1133331111',
    ultima_verificacao_em: diasAtras(3),
    localizacao: { lat: -23.561, lng: -46.645 },
  },
  {
    id: '3',
    nome: 'Banco de Alimentos Mãos Unidas',
    categoria: 'refeicao',
    distancia_m: 2600,
    aberto_agora: false,
    horario_hoje: 'abre amanhã às 8h',
    endereco: 'Rua Ipiranga, 33 · República',
    telefone: null,
    ultima_verificacao_em: diasAtras(125),
    localizacao: { lat: -23.544, lng: -46.642 },
  },
]