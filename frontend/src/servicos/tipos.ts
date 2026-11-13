export type Categoria = 'abrigo' | 'refeitorio' | 'juridico' | 'saude' | 'cras' | 'documentos'

// Mesmo formato da resposta de GET /servicos (seção 7 da documentação)
export type Servico = {
  id: string
  nome: string
  categoria: Categoria
  distancia_m: number
  aberto_agora: boolean
  horario_hoje: string
  // Endereço restrito (abrigos para vítimas de violência): endereco e localizacao vêm null
  endereco_restrito: boolean
  endereco: string | null
  cidade: string
  uf: string
  telefone: string | null
  ultima_verificacao_em: string | null
  localizacao: { lat: number; lng: number } | null
}

export type Local =
  | { tipo: 'gps'; lat: number; lng: number }
  | { tipo: 'texto'; texto: string }

export type Busca = {
  local: Local | null
  categoria: Categoria | null
}

// Tabela horarios_funcionamento: dia_semana vai de 0 (domingo) a 6 (sábado)
export type Horario = {
  dia_semana: number
  abre: string
  fecha: string
}

// Resposta de GET /servicos/{id}: tudo do serviço, mais os detalhes.
// Sem a posição de quem busca, a distância vem null.
export type ServicoDetalhe = Omit<Servico, 'distancia_m'> & {
  distancia_m: number | null
  descricao: string
  cep: string | null
  documentos_exigidos: string | null
  horarios: Horario[]
}