import { Prisma } from '../generated/prisma/client.js'
import { banco } from '../plugins/banco.js'
import type { Horario } from '../servicos/horarios.js'

export type LinhaServico = {
  id: string
  nome: string
  categoria: string
  endereco: string
  endereco_restrito: boolean
  cidade: string
  uf: string
  telefone: string | null
  ultima_verificacao_em: Date | null
  lat: number
  lng: number
  distancia_m: number
}

export type LinhaDetalhe = Omit<LinhaServico, 'distancia_m'> & {
  descricao: string | null
  cep: string | null
  documentos_exigidos: string | null
}

type FiltroProximos = {
  lat: number
  lng: number
  raioM: number
  categoria?: string | undefined
}

export async function buscarProximos({ lat, lng, raioM, categoria }: FiltroProximos) {
  const filtroCategoria = categoria ? Prisma.sql`AND c.slug = ${categoria}` : Prisma.empty

  return banco.$queryRaw<LinhaServico[]>`
    SELECT s.id, s.nome, c.slug AS categoria, s.endereco, s.endereco_restrito, s.cidade, s.uf,
           s.telefone, s.ultima_verificacao_em,
           ST_Y(s.localizacao::geometry) AS lat,
           ST_X(s.localizacao::geometry) AS lng,
           ST_Distance(s.localizacao, ponto.geo) AS distancia_m
      FROM servicos s
      JOIN categorias c ON c.id = s.categoria_id
     CROSS JOIN (SELECT ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography AS geo) ponto
     WHERE s.status = 'publicado'
       AND ST_DWithin(s.localizacao, ponto.geo, ${raioM})
       ${filtroCategoria}
     ORDER BY distancia_m
     LIMIT 50`
}

export async function buscarPublicadoPorId(id: string) {
  const linhas = await banco.$queryRaw<LinhaDetalhe[]>`
    SELECT s.id, s.nome, s.descricao, c.slug AS categoria, s.endereco, s.endereco_restrito,
           s.cidade, s.uf, s.cep, s.telefone, s.documentos_exigidos, s.ultima_verificacao_em,
           ST_Y(s.localizacao::geometry) AS lat,
           ST_X(s.localizacao::geometry) AS lng
      FROM servicos s
      JOIN categorias c ON c.id = s.categoria_id
     WHERE s.id = ${id}::uuid AND s.status = 'publicado'`
  return linhas[0] ?? null
}

const hhmm = (data: Date) => data.toISOString().slice(11, 16)

export async function horariosDosServicos(ids: string[]) {
  const linhas = await banco.horarios_funcionamento.findMany({
    where: { servico_id: { in: ids } },
    orderBy: [{ dia_semana: 'asc' }, { abre: 'asc' }],
  })

  const porServico = new Map<string, Horario[]>()
  for (const l of linhas) {
    const lista = porServico.get(l.servico_id) ?? []
    lista.push({ dia_semana: l.dia_semana, abre: hhmm(l.abre), fecha: hhmm(l.fecha) })
    porServico.set(l.servico_id, lista)
  }
  return porServico
}

export async function existePublicado(id: string) {
  const total = await banco.servicos.count({ where: { id, status: 'publicado' } })
  return total > 0
}

export async function criarDenuncia(servicoId: string, motivo: string, descricao: string | null) {
  await banco.denuncias.create({
    data: { servico_id: servicoId, motivo, descricao },
  })
}

export async function listarCategorias() {
  return banco.categorias.findMany({ select: { slug: true, nome: true }, orderBy: { id: 'asc' } })
}

export async function confirmouRecentemente(servicoId: string, usuarioId: string) {
  const total = await banco.verificacoes.count({
    where: {
      servico_id: servicoId,
      usuario_id: usuarioId,
      tipo: 'confirmacao',
      criado_em: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  })
  return total > 0
}

export async function criarConfirmacao(servicoId: string, usuarioId: string) {
  const verificacao = await banco.verificacoes.create({
    data: { servico_id: servicoId, usuario_id: usuarioId, tipo: 'confirmacao', resultado: 'confirmado' },
  })
  return verificacao.criado_em
}

type LinhaDadosAbertos = {
  id: string
  nome: string
  categoria: string
  endereco: string
  cidade: string
  uf: string
  cep: string | null
  telefone: string | null
  documentos_exigidos: string | null
  ultima_verificacao_em: Date | null
  selo: string
  lat: number
  lng: number
}

export function servicosParaDadosAbertos() {
  return banco.$queryRaw<LinhaDadosAbertos[]>`
    SELECT id, nome, categoria_slug AS categoria, endereco, cidade, uf, cep, telefone, documentos_exigidos,
           ultima_verificacao_em, selo, latitude AS lat, longitude AS lng
      FROM vw_servicos_publicos
     WHERE NOT endereco_restrito
     ORDER BY uf, cidade, nome`
}
