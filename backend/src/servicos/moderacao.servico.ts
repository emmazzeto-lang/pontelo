import { ErroApi } from '../erros.js'
import type { status_denuncia, status_servico } from '../generated/prisma/client.js'
import * as repositorio from '../repositorios/moderacao.repositorio.js'
import { horariosDosServicos } from '../repositorios/servicos.repositorio.js'
import { geocodificar } from './geocodificacao.servico.js'
import type { Horario } from './horarios.js'

type Sugestao = Omit<repositorio.NovoServico, 'lat' | 'lng' | 'criadoPor'>

async function localizar(s: Sugestao) {
  try {
    return await geocodificar({ q: `${s.endereco}, ${s.cidade}, ${s.uf}, Brasil` })
  } catch (erro) {
    if (!(erro instanceof ErroApi && erro.codigo === 'LOCAL_NAO_ENCONTRADO')) throw erro
  }
  if (s.cep) {
    try {
      return await geocodificar({ cep: s.cep })
    } catch (erro) {
      if (!(erro instanceof ErroApi && erro.codigo === 'LOCAL_NAO_ENCONTRADO')) throw erro
    }
  }
  throw new ErroApi(422, 'ENDERECO_NAO_ENCONTRADO', 'Não achamos esse endereço no mapa. Confira a rua, o número e a cidade.')
}

function conferirHorarios(horarios: Horario[]) {
  const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))
  for (let dia = 0; dia <= 6; dia++) {
    const doDia = horarios
      .filter((h) => h.dia_semana === dia && minutos(h.fecha) > minutos(h.abre))
      .sort((a, b) => minutos(a.abre) - minutos(b.abre))
    for (let i = 1; i < doDia.length; i++) {
      if (minutos(doDia[i]!.abre) < minutos(doDia[i - 1]!.fecha)) {
        throw new ErroApi(400, 'HORARIOS_SOBREPOSTOS', 'Há horários que se sobrepõem no mesmo dia.')
      }
    }
  }
}

export async function sugerir(sugestao: Sugestao, usuarioId: string) {
  conferirHorarios(sugestao.horarios)
  const { lat, lng } = await localizar(sugestao)
  const id = await repositorio.criarServicoPendente({ ...sugestao, lat, lng, criadoPor: usuarioId })
  return { dados: { id, status: 'pendente' as const } }
}

export async function fila(status: status_servico) {
  const linhas = await repositorio.listarPorStatus(status)
  const horarios = await horariosDosServicos(linhas.map((l) => l.id))

  return {
    dados: linhas.map(({ lat, lng, criado_em, ...resto }) => ({
      ...resto,
      criado_em: criado_em.toISOString(),
      localizacao: { lat, lng },
      horarios: horarios.get(resto.id) ?? [],
    })),
  }
}

type Decisao = 'publicar' | 'rejeitar' | 'arquivar'

const transicoes: Record<Decisao, { de: status_servico[]; para: status_servico }> = {
  publicar: { de: ['pendente', 'arquivado'], para: 'publicado' },
  rejeitar: { de: ['pendente'], para: 'rejeitado' },
  arquivar: { de: ['publicado'], para: 'arquivado' },
}

export async function decidir(id: string, decisao: Decisao, moderadorId: string, motivo?: string) {
  const servico = await repositorio.statusDoServico(id)
  if (!servico) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Serviço não encontrado.')

  const { de, para } = transicoes[decisao]
  if (!de.includes(servico.status)) {
    throw new ErroApi(409, 'DECISAO_INVALIDA', `Não dá para ${decisao} um serviço com status "${servico.status}".`)
  }

  await repositorio.decidir(id, para, moderadorId, motivo || null)
  return { dados: { id, status: para } }
}

export async function denuncias(status: status_denuncia) {
  const linhas = await repositorio.listarDenuncias(status)
  return {
    dados: linhas.map(({ servicos, criado_em, ...resto }) => ({
      ...resto,
      criado_em: criado_em.toISOString(),
      servico: servicos,
    })),
  }
}

export async function mudarDenuncia(id: string, status: status_denuncia, moderadorId: string) {
  if (!(await repositorio.atualizarDenuncia(id, status, moderadorId))) {
    throw new ErroApi(404, 'NAO_ENCONTRADO', 'Denúncia não encontrada.')
  }
  return { dados: { id, status } }
}
