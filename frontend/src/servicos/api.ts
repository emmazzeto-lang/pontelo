import { buscarDetalheExemplo } from '../dados/detalhesExemplo'
import { servicosExemplo } from '../dados/servicosExemplo'
import { filtrarServicos } from './filtrar'
import { guardarSessao, limparSessao, obterToken, type Usuario } from './sessao'
import type {
  Categoria,
  DenunciaModeracao,
  Local,
  NovaSugestao,
  Servico,
  ServicoDetalhe,
  ServicoModeracao,
  StatusDenuncia,
  StatusServico,
} from './tipos'

const URL_API = import.meta.env.VITE_API_URL
const usarExemplos = import.meta.env.VITE_USAR_EXEMPLOS === 'true'

export type DetalheErro = { campo: string; problema: string }

// Erro no formato da documentação: { "erro": { "codigo": "...", "mensagem": "...", "detalhes"?: [...] } }
export class ErroApi extends Error {
  status: number
  codigo: string
  detalhes: DetalheErro[]

  constructor(status: number, codigo: string, mensagem: string, detalhes: DetalheErro[] = []) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.codigo = codigo
    this.detalhes = detalhes
  }
}

type Opcoes = {
  corpo?: unknown
  metodo?: 'GET' | 'POST' | 'PATCH'
  // Rotas /auth: o navegador precisa mandar e receber o cookie de sessão
  comCookie?: boolean
}

async function pedir<T>(caminho: string, opcoes: Opcoes = {}, jaRenovou = false): Promise<T> {
  const { corpo, metodo = corpo === undefined ? 'GET' : 'POST', comCookie = false } = opcoes
  const token = obterToken()

  const cabecalhos: Record<string, string> = {}
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (token) cabecalhos.Authorization = `Bearer ${token}`

  let resposta: Response
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      credentials: comCookie ? 'include' : 'same-origin',
    })
  } catch {
    throw new ErroApi(0, 'SEM_CONEXAO', 'Sem conexão com a internet.')
  }

  // O token de acesso vale 15 minutos. Se venceu, renova uma vez pelo cookie e repete o pedido.
  if (resposta.status === 401 && token && !comCookie && !jaRenovou) {
    if (await renovarSessao()) return pedir<T>(caminho, opcoes, true)
  }

  if (!resposta.ok) {
    const erro = (await resposta.json().catch(() => null)) as {
      erro?: { codigo: string; mensagem: string; detalhes?: DetalheErro[] }
    } | null
    throw new ErroApi(
      resposta.status,
      erro?.erro?.codigo ?? 'ERRO',
      erro?.erro?.mensagem ?? 'Algo deu errado.',
      erro?.erro?.detalhes,
    )
  }

  if (resposta.status === 204) return undefined as T
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

// POST /servicos/{id}/denuncias (anônimo)
export async function enviarDenuncia(id: string, motivo: string, descricao: string) {
  if (usarExemplos) {
    await esperar(400)
    return
  }
  await pedir(`/servicos/${encodeURIComponent(id)}/denuncias`, {
    corpo: { motivo, ...(descricao.trim() && { descricao: descricao.trim() }) },
  })
}

// POST /servicos/{id}/confirmacoes (exige login)
export async function confirmarServico(id: string): Promise<string> {
  if (usarExemplos) {
    await esperar(400)
    return new Date().toISOString()
  }
  const resposta = await pedir<{ dados: { ultima_verificacao_em: string } }>(
    `/servicos/${encodeURIComponent(id)}/confirmacoes`,
    { metodo: 'POST' },
  )
  return resposta.dados.ultima_verificacao_em
}

// POST /servicos (exige login): entra como pendente
export async function sugerirServico(sugestao: NovaSugestao) {
  if (usarExemplos) {
    await esperar(600)
    return
  }
  await pedir('/servicos', { corpo: sugestao })
}

// ---------------- Moderação (só papel "moderador") ----------------

export async function listarFila(status: StatusServico) {
  const resposta = await pedir<{ dados: ServicoModeracao[] }>(`/moderacao/servicos?status=${status}`)
  return resposta.dados
}

export async function decidirServico(id: string, decisao: 'publicar' | 'rejeitar' | 'arquivar', motivo?: string) {
  await pedir(`/moderacao/servicos/${encodeURIComponent(id)}/decisao`, {
    corpo: { decisao, ...(motivo?.trim() && { motivo: motivo.trim() }) },
  })
}

export async function listarDenuncias(status: StatusDenuncia) {
  const resposta = await pedir<{ dados: DenunciaModeracao[] }>(`/moderacao/denuncias?status=${status}`)
  return resposta.dados
}

export async function mudarDenuncia(id: string, status: Exclude<StatusDenuncia, 'aberta'>) {
  await pedir(`/moderacao/denuncias/${encodeURIComponent(id)}`, { metodo: 'PATCH', corpo: { status } })
}

// ---------------- Conta ----------------

type RespostaSessao = { dados: { usuario: Usuario; token_acesso: string } }

const usuarioExemplo: Usuario = { id: 'exemplo', nome: 'Pessoa de Exemplo', email: 'exemplo@pontelo.test', papel: 'colaborador' }

// POST /auth/login
export async function entrar(email: string, senha: string) {
  if (usarExemplos) {
    await esperar(400)
    guardarSessao({ ...usuarioExemplo, email }, 'exemplo')
    return
  }
  const { dados } = await pedir<RespostaSessao>('/auth/login', { corpo: { email, senha }, comCookie: true })
  guardarSessao(dados.usuario, dados.token_acesso)
}

// POST /auth/registro (a API já devolve a pessoa logada)
export async function cadastrar(nome: string, email: string, senha: string) {
  if (usarExemplos) {
    await esperar(400)
    guardarSessao({ ...usuarioExemplo, nome, email }, 'exemplo')
    return
  }
  const { dados } = await pedir<RespostaSessao>('/auth/registro', {
    corpo: { nome, email, senha, aceite_privacidade: true },
    comCookie: true,
  })
  guardarSessao(dados.usuario, dados.token_acesso)
}

// POST /auth/logout
export async function sair() {
  // Sai na tela primeiro: mesmo sem internet, a pessoa não continua logada neste aparelho
  limparSessao()
  if (usarExemplos) return
  await pedir('/auth/logout', { metodo: 'POST', comCookie: true }).catch(() => undefined)
}

// Saída rápida: a página vai ser trocada AGORA, então não dá para esperar resposta.
// sendBeacon entrega o pedido mesmo com a página fechando, e a sessão não fica aberta no aparelho.
export function sairSemEsperar() {
  if (usarExemplos || !obterToken()) return
  try {
    navigator.sendBeacon(`${URL_API}/auth/logout`)
  } catch {
    // Sem sendBeacon: segue a saída mesmo assim
  }
}

// POST /auth/refresh. Cada cookie só vale UMA vez (a API troca a cada uso), então:
// - dentro da aba, pedidos simultâneos dividem a mesma renovação;
// - entre abas, a trava do navegador (Web Locks) faz uma esperar a outra.
let renovacaoEmAndamento: Promise<boolean> | null = null

export function renovarSessao(): Promise<boolean> {
  renovacaoEmAndamento ??= executarRenovacao().finally(() => {
    renovacaoEmAndamento = null
  })
  return renovacaoEmAndamento
}

async function executarRenovacao() {
  const tentar = async () => {
    try {
      const { dados } = await pedir<RespostaSessao>('/auth/refresh', { metodo: 'POST', comCookie: true }, true)
      guardarSessao(dados.usuario, dados.token_acesso)
      return true
    } catch (erro) {
      // Quem já estava logado e ficou sem internet continua logado; sessão inválida, não
      const semInternet = erro instanceof ErroApi && erro.codigo === 'SEM_CONEXAO'
      if (!(semInternet && obterToken())) limparSessao()
      return false
    }
  }
  return navigator.locks ? navigator.locks.request('pontelo-sessao', tentar) : tentar()
}

// Chamado uma vez ao abrir o site: se houver cookie de sessão, a pessoa continua logada
export function restaurarSessao() {
  if (usarExemplos) {
    limparSessao()
    return
  }
  void renovarSessao()
}
