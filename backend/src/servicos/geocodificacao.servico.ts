import { config } from '../config.js'
import { ErroApi } from '../erros.js'

type Coordenadas = { lat: number; lng: number }

// Cache em memória (seção 5 da documentação): evita repetir consultas e respeita o limite do Nominatim
const UM_DIA_MS = 24 * 60 * 60 * 1000
const LIMITE_CACHE = 1000
const cache = new Map<string, { valor: Coordenadas; expira: number }>()

function lerCache(chave: string) {
  const item = cache.get(chave)
  if (!item || item.expira < Date.now()) return null
  return item.valor
}

function guardarCache(chave: string, valor: Coordenadas) {
  if (cache.size >= LIMITE_CACHE) {
    const maisAntiga = cache.keys().next().value
    if (maisAntiga !== undefined) cache.delete(maisAntiga)
  }
  cache.set(chave, { valor, expira: Date.now() + UM_DIA_MS })
}

// Política do Nominatim: no máximo 1 pedido por segundo.
// Cada chamada reserva a próxima vaga antes de esperar, então pedidos simultâneos fazem fila.
let proximaVaga = 0
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms))

async function aguardarVezNominatim() {
  const agora = Date.now()
  const minhaVez = Math.max(agora, proximaVaga)
  proximaVaga = minhaVez + 1100
  if (minhaVez > agora) await esperar(minhaVez - agora)
}

async function buscarJson<T>(url: string): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(url, {
      headers: { 'User-Agent': config.NOMINATIM_USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new ErroApi(502, 'GEOCODIFICACAO_INDISPONIVEL', 'Não foi possível consultar o endereço agora. Tente de novo.')
  }
  if (!resposta.ok) {
    throw new ErroApi(502, 'GEOCODIFICACAO_INDISPONIVEL', 'Não foi possível consultar o endereço agora. Tente de novo.')
  }
  return resposta.json() as Promise<T>
}

async function nominatim(parametros: Record<string, string>): Promise<Coordenadas | null> {
  await aguardarVezNominatim()
  const busca = new URLSearchParams({ format: 'jsonv2', limit: '1', countrycodes: 'br', ...parametros })
  const resultados = await buscarJson<{ lat: string; lon: string }[]>(`https://nominatim.openstreetmap.org/search?${busca}`)
  const primeiro = resultados[0]
  return primeiro ? { lat: Number(primeiro.lat), lng: Number(primeiro.lon) } : null
}

type RespostaViaCep = { erro?: boolean | string; logradouro?: string; localidade?: string; uf?: string }

async function porCep(cep: string) {
  const endereco = await buscarJson<RespostaViaCep>(`https://viacep.com.br/ws/${cep}/json/`)
  if (endereco.erro || !endereco.localidade || !endereco.uf) return null

  // Tenta a rua; se o Nominatim não achar, fica com o centro da cidade
  const cidade = { city: endereco.localidade, state: endereco.uf, country: 'Brasil' }
  if (endereco.logradouro) {
    const naRua = await nominatim({ ...cidade, street: endereco.logradouro })
    if (naRua) return naRua
  }
  return nominatim(cidade)
}

export async function geocodificar(entrada: { cep?: string | undefined; q?: string | undefined }) {
  const cep = entrada.cep?.replace(/\D/g, '')
  const texto = entrada.q?.trim()
  const chave = cep ? `cep:${cep}` : `q:${texto?.toLowerCase()}`

  const guardado = lerCache(chave)
  if (guardado) return guardado

  const resultado = cep ? await porCep(cep) : await nominatim({ q: texto ?? '' })
  if (!resultado) {
    throw new ErroApi(404, 'LOCAL_NAO_ENCONTRADO', 'Não encontramos esse CEP ou cidade. Confira e tente de novo.')
  }

  guardarCache(chave, resultado)
  return resultado
}
