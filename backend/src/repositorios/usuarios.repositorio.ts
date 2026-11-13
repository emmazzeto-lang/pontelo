import { banco } from '../plugins/banco.js'

// Só o que pode sair da API: nunca o senha_hash
const camposPublicos = { id: true, nome: true, email: true, papel: true } as const

export function buscarPorEmail(email: string) {
  return banco.usuarios.findFirst({ where: { email } })
}

export function buscarPorId(id: string) {
  return banco.usuarios.findUnique({ where: { id }, select: camposPublicos })
}

export function criarUsuario(dados: { nome: string; email: string; senhaHash: string }) {
  return banco.usuarios.create({
    data: { nome: dados.nome, email: dados.email, senha_hash: dados.senhaHash },
    select: camposPublicos,
  })
}

// ---- Refresh tokens: o banco guarda só o hash, nunca o token em si ----

export async function salvarRefresh(usuarioId: string, tokenHash: string, expiraEm: Date) {
  // Aproveita para limpar os vencidos dessa pessoa, para a tabela não crescer para sempre
  await banco.refresh_tokens.deleteMany({ where: { usuario_id: usuarioId, expira_em: { lt: new Date() } } })
  await banco.refresh_tokens.create({ data: { usuario_id: usuarioId, token_hash: tokenHash, expira_em: expiraEm } })
}

export function buscarRefresh(tokenHash: string) {
  return banco.refresh_tokens.findUnique({ where: { token_hash: tokenHash } })
}

// Revoga só se ainda estiver ativo. Devolve false se outro pedido revogou antes (uso duplicado).
export async function revogarRefresh(id: string) {
  const { count } = await banco.refresh_tokens.updateMany({ where: { id, revogado: false }, data: { revogado: true } })
  return count === 1
}

export async function revogarTodos(usuarioId: string) {
  await banco.refresh_tokens.updateMany({ where: { usuario_id: usuarioId, revogado: false }, data: { revogado: true } })
}
