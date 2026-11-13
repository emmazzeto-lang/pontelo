import { ErroApi } from '../servicos/api'

export function destinoDepoisDoLogin(estado: unknown) {
  const de = (estado as { de?: unknown } | null)?.de
  const valido = typeof de === 'string' && de.startsWith('/') && !de.startsWith('//')
  return valido && !['/entrar', '/criar-conta'].includes(de) ? de : '/'
}

export function mensagemDeFalha(erro: Error) {
  if (!(erro instanceof ErroApi)) return 'Não conseguimos entrar agora. Tente de novo em alguns minutos.'
  if (erro.codigo === 'SEM_CONEXAO') return 'Sem internet. Confira a conexão e tente de novo.'
  if (erro.status === 429) return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
  if (erro.status < 500) return erro.message
  return 'Não conseguimos entrar agora. Tente de novo em alguns minutos.'
}
