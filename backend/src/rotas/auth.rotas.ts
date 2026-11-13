import type { FastifyInstance, FastifyReply } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { config } from '../config.js'
import * as esquemas from '../esquemas/auth.esquemas.js'
import { erroResposta } from '../esquemas/servicos.esquemas.js'
import { autenticar } from '../plugins/autenticacao.js'
import * as auth from '../servicos/auth.servico.js'

const COOKIE = 'pontelo_sessao'

// HttpOnly: o JavaScript da página não consegue ler (protege contra XSS).
// SameSite strict: outro site não consegue usar o cookie. Path: só viaja para as rotas /auth.
const opcoesCookie = {
  httpOnly: true,
  secure: config.COOKIE_SEGURO,
  sameSite: 'strict',
  path: '/api/v1/auth',
} as const

type Usuario = { id: string; nome: string; email: string; papel: 'colaborador' | 'organizacao' | 'moderador' }

// Entrega a sessão: token de acesso no corpo (o front guarda só na memória) e refresh no cookie
function iniciarSessao(app: FastifyInstance, resposta: FastifyReply, usuario: Usuario, refresh: string) {
  resposta.setCookie(COOKIE, refresh, { ...opcoesCookie, maxAge: auth.DURACAO_REFRESH_S })
  const token_acesso = app.jwt.sign({ sub: usuario.id, papel: usuario.papel }, { expiresIn: '15m' })
  return { dados: { usuario, token_acesso } }
}

export const rotasAuth: FastifyPluginAsyncZod = async (app) => {
  // Respostas com token nunca ficam guardadas em cache (nem no navegador, nem em proxy)
  app.addHook('onSend', async (_pedido, resposta) => {
    resposta.header('Cache-Control', 'no-store')
  })

  // Contra tentativa de adivinhar senha: poucas tentativas por IP
  const limiteLogin = { rateLimit: { max: 10, timeWindow: '10 minutes' } }

  app.post(
    '/auth/registro',
    {
      config: limiteLogin,
      schema: {
        tags: ['Conta'],
        summary: 'Cria uma conta de colaborador e já entra nela',
        body: esquemas.registro,
        response: { 201: esquemas.sessao, 400: erroResposta, 409: erroResposta },
      },
    },
    async (pedido, resposta) => {
      const { usuario, refresh } = await auth.registrar(pedido.body)
      return resposta.status(201).send(iniciarSessao(app, resposta, usuario, refresh))
    },
  )

  app.post(
    '/auth/login',
    {
      config: limiteLogin,
      schema: {
        tags: ['Conta'],
        summary: 'Entra com e-mail e senha',
        body: esquemas.login,
        response: { 200: esquemas.sessao, 401: erroResposta },
      },
    },
    async (pedido, resposta) => {
      const { usuario, refresh } = await auth.entrar(pedido.body.email, pedido.body.senha)
      return iniciarSessao(app, resposta, usuario, refresh)
    },
  )

  app.post(
    '/auth/refresh',
    {
      schema: {
        tags: ['Conta'],
        summary: 'Troca o cookie de sessão por um token de acesso novo (o cookie também é trocado)',
        response: { 200: esquemas.sessao, 401: erroResposta },
      },
    },
    async (pedido, resposta) => {
      try {
        const { usuario, refresh } = await auth.renovar(pedido.cookies[COOKIE])
        return iniciarSessao(app, resposta, usuario, refresh)
      } catch (erro) {
        resposta.clearCookie(COOKIE, opcoesCookie)
        throw erro
      }
    },
  )

  app.post(
    '/auth/logout',
    {
      schema: { tags: ['Conta'], summary: 'Sai da conta neste navegador' },
    },
    async (pedido, resposta) => {
      await auth.sair(pedido.cookies[COOKIE])
      resposta.clearCookie(COOKIE, opcoesCookie)
      return resposta.status(204).send()
    },
  )

  app.get(
    '/me',
    {
      preHandler: autenticar,
      schema: {
        tags: ['Conta'],
        summary: 'Dados de quem está logado',
        security: [{ bearer: [] }],
        response: { 200: esquemas.perfil, 401: erroResposta },
      },
    },
    async (pedido) => ({ dados: await auth.perfil(pedido.user.sub) }),
  )
}
