import { ErroApi } from '../erros.js'
import * as repositorio from '../repositorios/servicos.repositorio.js'
import type { LinhaDetalhe, LinhaServico } from '../repositorios/servicos.repositorio.js'
import { descreverHorarioHoje, intervaloAberto, momentoEmSaoPaulo, type Horario, type Momento } from './horarios.js'

type ParametrosLista = {
  lat: number
  lng: number
  raio: number
  categoria?: string | undefined
  aberto_agora: boolean
}

// Endereço restrito (seção 8 da documentação): nada que permita achar o lugar.
// A distância é arredondada para o quilômetro, para não dar para triangular a posição.
function protegerEndereco<T extends Pick<LinhaServico, 'endereco_restrito' | 'endereco' | 'lat' | 'lng'>>(linha: T) {
  if (!linha.endereco_restrito) {
    return { endereco: linha.endereco, localizacao: { lat: linha.lat, lng: linha.lng } }
  }
  return { endereco: null, localizacao: null }
}

const distanciaSegura = (linha: LinhaServico) =>
  linha.endereco_restrito ? Math.max(1000, Math.round(linha.distancia_m / 1000) * 1000) : Math.round(linha.distancia_m)

function camposComuns(linha: LinhaServico | LinhaDetalhe, horarios: Horario[], agora: Momento) {
  return {
    id: linha.id,
    nome: linha.nome,
    categoria: linha.categoria,
    aberto_agora: intervaloAberto(horarios, agora) !== undefined,
    horario_hoje: descreverHorarioHoje(horarios, agora),
    endereco_restrito: linha.endereco_restrito,
    cidade: linha.cidade,
    uf: linha.uf,
    telefone: linha.telefone,
    ultima_verificacao_em: linha.ultima_verificacao_em?.toISOString() ?? null,
    ...protegerEndereco(linha),
  }
}

export async function listarProximos(p: ParametrosLista) {
  const linhas = await repositorio.buscarProximos({ lat: p.lat, lng: p.lng, raioM: p.raio, categoria: p.categoria })
  const horarios = await repositorio.horariosDosServicos(linhas.map((l) => l.id))
  const agora = momentoEmSaoPaulo()

  const servicos = linhas
    .map((linha) => ({
      ...camposComuns(linha, horarios.get(linha.id) ?? [], agora),
      distancia_m: distanciaSegura(linha),
    }))
    .filter((s) => !p.aberto_agora || s.aberto_agora)

  return { dados: servicos, pagina: 1, total: servicos.length }
}

export async function detalhar(id: string) {
  const linha = await repositorio.buscarPublicadoPorId(id)
  if (!linha) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Serviço não encontrado.')

  const horarios = (await repositorio.horariosDosServicos([id])).get(id) ?? []

  return {
    dados: {
      ...camposComuns(linha, horarios, momentoEmSaoPaulo()),
      distancia_m: null,
      descricao: linha.descricao ?? '',
      cep: linha.endereco_restrito ? null : linha.cep,
      documentos_exigidos: linha.documentos_exigidos,
      horarios,
    },
  }
}

export async function denunciar(id: string, motivo: string, descricao?: string) {
  if (!(await repositorio.existePublicado(id))) {
    throw new ErroApi(404, 'NAO_ENCONTRADO', 'Serviço não encontrado.')
  }
  await repositorio.criarDenuncia(id, motivo, descricao?.trim() || null)
}

// "Confirmo que ainda funciona": uma vez por pessoa, por serviço, a cada 24 horas
export async function confirmar(servicoId: string, usuarioId: string) {
  if (!(await repositorio.existePublicado(servicoId))) {
    throw new ErroApi(404, 'NAO_ENCONTRADO', 'Serviço não encontrado.')
  }
  if (await repositorio.confirmouRecentemente(servicoId, usuarioId)) {
    throw new ErroApi(409, 'CONFIRMACAO_RECENTE', 'Você já confirmou este serviço nas últimas 24 horas. Obrigado!')
  }
  const quando = await repositorio.criarConfirmacao(servicoId, usuarioId)
  return { dados: { ultima_verificacao_em: quando.toISOString() } }
}
