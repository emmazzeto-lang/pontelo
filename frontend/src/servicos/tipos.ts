export type Categoria = 'abrigo' | 'refeicao' | 'juridico' | 'saude' | 'cras' | 'documentos'

// Mesmo formato da resposta de GET /servicos (seção 7 da documentação)
export type Servico = {
  id: string
  nome: string
  categoria: Categoria
  distancia_m: number
  aberto_agora: boolean
  horario_hoje: string
  endereco: string
  telefone: string | null
  ultima_verificacao_em: string | null
  localizacao: { lat: number; lng: number }
}

export type Local =
  | { tipo: 'gps'; lat: number; lng: number }
  | { tipo: 'texto'; texto: string }

export type Busca = {
  local: Local | null
  categoria: Categoria | null
}