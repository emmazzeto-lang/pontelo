import { buscarDetalheExemplo } from '../dados/detalhesExemplo'
import { servicosExemplo } from '../dados/servicosExemplo'
import { filtrarServicos } from './filtrar'
import type { Categoria, Local, Servico, ServicoDetalhe } from './tipos'

const URL_API = import.meta.env.VITE_API_URL
const usarExemplos = import.meta.env.VITE_USAR_EXEMPLOS === 'true'

// Erro no formato da documentação: { "erro": { "codigo": "...", "mensagem": "..." } }
export class ErroApi extends Error {
  status: number
  codigo: string

  constructor(status: number, codigo: string, mensagem: string) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.codigo = codigo
  }
}

async function pedir<T>(caminho: string): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`${URL_API}${caminho}`)
  } catch {
    throw new ErroApi(0, 'SEM_CONEXAO', 'Sem conexão com a internet.')
  }

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => null)) as { erro?: { codigo: string; mensagem: string } } | null
    throw new ErroApi(resposta.status, corpo?.erro?.codigo ?? 'ERRO', corpo?.erro?.mensagem ?? 'Algo deu errado.')
  }

  return resposta.json() as Promise<T>
}

// Simula o tempo de resposta da rede no modo de exemplo
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms))

export type ParametrosBusca = {
  local: Local
  categoria: Categoria | null
  raioM: number
  abertoAgora: boolean
}

// GET /geocodificar: transforma CEP ou endereço em coordenadas
async function geocodificar(texto: string) {
  const apenasNumeros = texto.replace(/\D/g, '')
  const consulta = apenasNumeros.length === 8 ? `cep=${apenasNumeros}` : `q=${encodeURIComponent(texto)}`
  return pedir<{ lat: number; lng: number }>(`/geocodificar?${consulta}`)
}

// GET /servicos
export async function listarServicos(p: ParametrosBusca): Promise<Servico[]> {
  if (usarExemplos) {
    await esperar(500)
    return filtrarServicos(servicosExemplo, {
      categoria: p.categoria,
      raioM: p.raioM,
      abertoAgora: p.abertoAgora,
      soConferidos: false,
    })
  }

  const { lat, lng } = p.local.tipo === 'gps' ? p.local : await geocodificar(p.local.texto)

  const parametros = new URLSearchParams({ lat: String(lat), lng: String(lng), raio: String(p.raioM) })
  if (p.categoria) parametros.set('categoria', p.categoria)
  if (p.abertoAgora) parametros.set('aberto_agora', 'true')

  const resposta = await pedir<{ dados: Servico[] }>(`/servicos?${parametros}`)
  return resposta.dados
}

// GET /servicos/{id}
export async function obterServico(id: string): Promise<ServicoDetalhe> {
  if (usarExemplos) {
    await esperar(400)
    const servico = buscarDetalheExemplo(id)
    if (!servico) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Serviço não encontrado.')
    return servico
  }

  const resposta = await pedir<{ dados: ServicoDetalhe }>(`/servicos/${encodeURIComponent(id)}`)
  return resposta.dados
}