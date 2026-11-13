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

// ---- Direitos do titular (LGPD, seção 8) ----

export function buscarComSenha(id: string) {
  return banco.usuarios.findUnique({ where: { id } })
}

// Tudo o que o Pontelo guarda sobre a pessoa, para ela baixar
export function dadosDoTitular(id: string) {
  return banco.usuarios.findUnique({
    where: { id },
    select: {
      nome: true,
      email: true,
      papel: true,
      criado_em: true,
      servicos: { select: { nome: true, status: true, criado_em: true }, orderBy: { criado_em: 'asc' } },
      verificacoes: {
        where: { tipo: 'confirmacao' },
        select: { criado_em: true, servicos: { select: { nome: true } } },
        orderBy: { criado_em: 'asc' },
      },
      denuncias_denuncias_usuario_idTousuarios: { select: { motivo: true, criado_em: true } },
    },
  })
}

// Exclusão por anonimização: os serviços que a pessoa sugeriu continuam no mapa (ajudam outras pessoas),
// mas nada mais aponta para quem ela é. Nome, e-mail e senha são trocados; sessões são apagadas.
export async function anonimizar(id: string, senhaHashAleatoria: string) {
  await banco.$transaction([
    banco.refresh_tokens.deleteMany({ where: { usuario_id: id } }),
    banco.denuncias.updateMany({ where: { usuario_id: id }, data: { usuario_id: null } }),
    banco.usuarios.update({
      where: { id },
      data: {
        nome: 'Conta excluída',
        email: `excluida-${id}@pontelo.invalid`,
        senha_hash: senhaHashAleatoria,
        papel: 'colaborador',
      },
    }),
  ])
}
