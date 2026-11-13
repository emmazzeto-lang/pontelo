import type { status_denuncia, status_servico } from '../generated/prisma/client.js'
import { banco } from '../plugins/banco.js'
import type { Horario } from '../servicos/horarios.js'

export type NovoServico = {
  nome: string
  categoria: string
  descricao: string
  endereco: string
  cidade: string
  uf: string
  cep: string | null
  telefone: string | null
  documentos_exigidos: string | null
  endereco_restrito: boolean
  horarios: Horario[]
  lat: number
  lng: number
  criadoPor: string
}

const paraTime = (hora: string) => new Date(`1970-01-01T${hora}:00Z`)

export async function criarServicoPendente(s: NovoServico) {
  return banco.$transaction(async (tx) => {
    const [criado] = await tx.$queryRaw<{ id: string }[]>`
      INSERT INTO servicos (nome, descricao, categoria_id, endereco, endereco_restrito, cidade, uf, cep,
                            localizacao, telefone, documentos_exigidos, status, criado_por)
      VALUES (${s.nome}, ${s.descricao}, (SELECT id FROM categorias WHERE slug = ${s.categoria}),
              ${s.endereco}, ${s.endereco_restrito}, ${s.cidade}, ${s.uf}, ${s.cep},
              ST_SetSRID(ST_MakePoint(${s.lng}, ${s.lat}), 4326)::geography,
              ${s.telefone}, ${s.documentos_exigidos}, 'pendente', ${s.criadoPor}::uuid)
      RETURNING id`
    if (!criado) throw new Error('Falha ao criar serviço')

    if (s.horarios.length > 0) {
      await tx.horarios_funcionamento.createMany({
        data: s.horarios.map((h) => ({
          servico_id: criado.id,
          dia_semana: h.dia_semana,
          abre: paraTime(h.abre),
          fecha: paraTime(h.fecha),
        })),
      })
    }
    return criado.id
  })
}

export type LinhaModeracao = {
  id: string
  nome: string
  categoria: string
  descricao: string | null
  endereco: string
  endereco_restrito: boolean
  cidade: string
  uf: string
  cep: string | null
  telefone: string | null
  documentos_exigidos: string | null
  status: string
  criado_em: Date
  lat: number
  lng: number
  denuncias_abertas: number
}

export function listarPorStatus(status: status_servico) {
  return banco.$queryRaw<LinhaModeracao[]>`
    SELECT s.id, s.nome, c.slug AS categoria, s.descricao, s.endereco, s.endereco_restrito, s.cidade, s.uf,
           s.cep, s.telefone, s.documentos_exigidos, s.status::text AS status, s.criado_em,
           ST_Y(s.localizacao::geometry) AS lat,
           ST_X(s.localizacao::geometry) AS lng,
           (SELECT count(*)::int FROM denuncias d WHERE d.servico_id = s.id AND d.status IN ('aberta', 'em_analise'))
             AS denuncias_abertas
      FROM servicos s
      JOIN categorias c ON c.id = s.categoria_id
     WHERE s.status = ${status}::status_servico
     ORDER BY s.criado_em ASC
     LIMIT 100`
}

export function statusDoServico(id: string) {
  return banco.servicos.findUnique({ where: { id }, select: { status: true } })
}

export async function decidir(id: string, novoStatus: status_servico, moderadorId: string, motivo: string | null) {
  await banco.$transaction([
    banco.servicos.update({
      where: { id },
      data: {
        status: novoStatus,
        ...(novoStatus === 'publicado' && { ultima_verificacao_em: new Date() }),
      },
    }),
    banco.verificacoes.create({
      data: { servico_id: id, usuario_id: moderadorId, tipo: 'moderacao', resultado: novoStatus, comentario: motivo },
    }),
  ])
}

export function listarDenuncias(status: status_denuncia) {
  return banco.denuncias.findMany({
    where: { status },
    orderBy: { criado_em: 'asc' },
    take: 100,
    select: {
      id: true,
      motivo: true,
      descricao: true,
      status: true,
      criado_em: true,
      servicos: { select: { id: true, nome: true, status: true } },
    },
  })
}

export async function atualizarDenuncia(id: string, status: status_denuncia, moderadorId: string) {
  const { count } = await banco.denuncias.updateMany({
    where: { id },
    data: { status, resolvido_por: status === 'em_analise' ? null : moderadorId },
  })
  return count === 1
}
