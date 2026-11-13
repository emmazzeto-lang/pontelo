// Configuração do modo discreto. Fica SÓ neste aparelho (localStorage), nunca no servidor.
// O nome da chave é neutro de propósito: quem olhar o armazenamento do navegador vê "preferências da calculadora".

export type Contato = { nome: string; email: string }

export type Preferencias = {
  apelido: string // como os contatos conhecem a pessoa
  contatos: Contato[]
  codigoAbrir: string // número + "=" na calculadora abre o Pontelo
  codigoSocorro: string // número + "=" na calculadora envia o alerta
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

// Rascunho da configuração (apelido e contatos), para não perder os contatos se a pessoa sair
// da página antes de ativar: o convite já foi enviado e o contato pode aceitar depois.
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
    // sem armazenamento: o rascunho só vive enquanto a página estiver aberta
  }
}

export function apagarPreferencias() {
  try {
    localStorage.removeItem(CHAVE_RASCUNHO)
    localStorage.removeItem(CHAVE)
  } catch {
    // sem acesso ao armazenamento: não havia nada salvo
  }
}

export const modoDiscretoAtivo = () => lerPreferencias() !== null

export const ENDERECO_CALCULADORA = '/calculadora.html'
