export type Contato = { nome: string; email: string }

export type Preferencias = {
  apelido: string
  contatos: Contato[]
  codigoAbrir: string
  codigoSocorro: string
}

const CHAVE = 'calc:preferencias'

export function lerPreferencias(): Preferencias | null {
  try {
    const texto = localStorage.getItem(CHAVE)
    return texto ? (JSON.parse(texto) as Preferencias) : null
  } catch {
    return null
  }
}

export function salvarPreferencias(preferencias: Preferencias) {
  localStorage.setItem(CHAVE, JSON.stringify(preferencias))
}

export type Rascunho = Pick<Preferencias, 'apelido' | 'contatos'>
const CHAVE_RASCUNHO = 'calc:rascunho'

export function lerRascunho(): Rascunho | null {
  try {
    const texto = localStorage.getItem(CHAVE_RASCUNHO)
    return texto ? (JSON.parse(texto) as Rascunho) : null
  } catch {
    return null
  }
}

export function salvarRascunho(rascunho: Rascunho) {
  try {
    localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho))
  } catch {
    // Ignorado quando o armazenamento local não está disponível
  }
}

export function apagarPreferencias() {
  try {
    localStorage.removeItem(CHAVE_RASCUNHO)
    localStorage.removeItem(CHAVE)
  } catch {
    // Ignorado quando o armazenamento local não está disponível
  }
}

export const modoDiscretoAtivo = () => lerPreferencias() !== null

export const ENDERECO_CALCULADORA = '/calculadora.html'
