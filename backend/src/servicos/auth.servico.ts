import { createHmac, randomBytes } from 'node:crypto'
import argon2 from 'argon2'
import { config } from '../config.js'
import { ErroApi } from '../erros.js'
import * as repositorio from '../repositorios/usuarios.repositorio.js'

export const DURACAO_REFRESH_S = 7 * 24 * 60 * 60 // 7 dias

const credenciaisErradas = () => new ErroApi(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.')
const sessaoInvalida = () => new ErroApi(401, 'SESSAO_INVALIDA', 'Sua sessão terminou. Entre de novo.')

// O token vai para o cookie; o banco guarda só este hash. Se o banco vazar, os tokens não servem.
const hashDoToken = (token: string) => createHmac('sha256', config.REFRESH_TOKEN_SECRET).update(token).digest('hex')

// Cria um refresh token novo (aleatório, sem dados dentro) e registra o hash no banco
async function novoRefresh(usuarioId: string) {
  const token = randomBytes(32).toString('base64url')
  await repositorio.salvarRefresh(usuarioId, hashDoToken(token), new Date(Date.now() + DURACAO_REFRESH_S * 1000))
  return token
}

export async function registrar(dados: { nome: string; email: string; senha: string }) {
  if (await repositorio.buscarPorEmail(dados.email)) {
    throw new ErroApi(409, 'EMAIL_EM_USO', 'Já existe uma conta com este e-mail. Tente entrar.')
  }
  // argon2.hash usa Argon2id por padrão, o algoritmo recomendado para senhas
  const senhaHash = await argon2.hash(dados.senha)
  const usuario = await repositorio.criarUsuario({ nome: dados.nome, email: dados.email, senhaHash })
  return { usuario, refresh: await novoRefresh(usuario.id) }
}

// Hash de uma senha qualquer, usado quando o e-mail não existe.
// Assim a resposta demora o mesmo tempo nos dois casos e ninguém descobre quais e-mails têm conta.
const hashFalso = argon2.hash(randomBytes(16).toString('hex'))

export async function entrar(email: string, senha: string) {
  const encontrado = await repositorio.buscarPorEmail(email)
  if (!encontrado) {
    await argon2.verify(await hashFalso, senha)
    throw credenciaisErradas()
  }
  if (!(await argon2.verify(encontrado.senha_hash, senha))) throw credenciaisErradas()

  const usuario = { id: encontrado.id, nome: encontrado.nome, email: encontrado.email, papel: encontrado.papel }
  return { usuario, refresh: await novoRefresh(usuario.id) }
}

// Troca o refresh token por um novo (rotação). Cada token só pode ser usado UMA vez.
export async function renovar(token: string | undefined) {
  if (!token) throw sessaoInvalida()

  const registro = await repositorio.buscarRefresh(hashDoToken(token))
  if (!registro || registro.expira_em < new Date()) throw sessaoInvalida()

  // Token já usado aparecendo de novo = alguém pode ter copiado o cookie.
  // Por segurança, encerra todas as sessões dessa pessoa.
  if (registro.revogado || !(await repositorio.revogarRefresh(registro.id))) {
    await repositorio.revogarTodos(registro.usuario_id)
    throw sessaoInvalida()
  }

  const usuario = await repositorio.buscarPorId(registro.usuario_id)
  if (!usuario) throw sessaoInvalida()
  return { usuario, refresh: await novoRefresh(usuario.id) }
}

export async function sair(token: string | undefined) {
  if (!token) return
  const registro = await repositorio.buscarRefresh(hashDoToken(token))
  if (registro) await repositorio.revogarRefresh(registro.id)
}

export async function perfil(id: string) {
  const usuario = await repositorio.buscarPorId(id)
  if (!usuario) throw new ErroApi(401, 'NAO_AUTENTICADO', 'Entre na sua conta para continuar.')
  return usuario
}
