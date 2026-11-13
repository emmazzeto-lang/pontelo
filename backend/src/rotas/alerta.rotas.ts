import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { erroResposta } from '../esquemas/servicos.esquemas.js'
import * as alerta from '../servicos/alerta.servico.js'

const email = z.string().trim().toLowerCase().max(254).pipe(z.email('E-mail inválido.'))
const apelido = z.string().trim().min(1, 'Informe como seus contatos conhecem você.').max(40)
const token = z.object({ token: z.string().min(10).max(1000) })
const ok = z.object({ dados: z.object({ ok: z.literal(true) }) })

const docs = { tags: ['Modo discreto'] }

export const rotasAlerta: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onSend', async (_pedido, resposta) => {
    resposta.header('Cache-Control', 'no-store')
  })

  app.post(
    '/alerta/contatos/convite',
    {
      config: { rateLimit: { max: 6, timeWindow: '1 hour' } },
      schema: {
        ...docs,
        summary: 'Envia ao contato um e-mail para ele aceitar receber alertas',
        body: z.object({ email, apelido }),
        response: { 200: ok, 400: erroResposta },
      },
    },
    async (pedido) => {
      await alerta.convidar(pedido.body.email, pedido.body.apelido)
      return { dados: { ok: true as const } }
    },
  )

  app.post(
    '/alerta/contatos/confirmar',
    {
      config: { rateLimit: { max: 20, timeWindow: '10 minutes' } },
      schema: { ...docs, summary: 'O contato aceita receber alertas (link do e-mail)', body: token, response: { 200: ok, 400: erroResposta } },
    },
    async (pedido) => {
      await alerta.confirmar(pedido.body.token)
      return { dados: { ok: true as const } }
    },
  )

  app.post(
    '/alerta/contatos/sair',
    {
      config: { rateLimit: { max: 20, timeWindow: '10 minutes' } },
      schema: { ...docs, summary: 'O contato deixa de receber alertas (link do e-mail)', body: token, response: { 200: ok, 400: erroResposta } },
    },
    async (pedido) => {
      await alerta.sair(pedido.body.token)
      return { dados: { ok: true as const } }
    },
  )

  app.post(
    '/alerta/contatos/situacao',
    {
      config: { rateLimit: { max: 30, timeWindow: '10 minutes' } },
      schema: {
        ...docs,
        summary: 'Quais destes e-mails já aceitaram ser contato de confiança',
        body: z.object({ emails: z.array(email).min(1).max(5) }),
        response: { 200: z.object({ dados: z.array(z.object({ email: z.string(), confirmado: z.boolean() })) }) },
      },
    },
    async (pedido) => ({ dados: await alerta.situacao(pedido.body.emails) }),
  )

  app.post(
    '/alerta',
    {
      config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
      schema: {
        ...docs,
        summary: 'Envia o pedido de ajuda para os contatos que aceitaram',
        description: 'Nada deste pedido é gravado: nem quem pediu, nem a localização, nem os contatos.',
        body: z.object({
          apelido,
          contatos: z.array(email).min(1).max(5),
          localizacao: z
            .object({
              lat: z.number().min(-90).max(90),
              lng: z.number().min(-180).max(180),
              precisao_m: z.number().min(0).max(100_000).optional(),
            })
            .optional(),
          teste: z.boolean().default(false),
        }),
        response: { 200: z.object({ dados: z.object({ enviados: z.number() }) }), 422: erroResposta, 502: erroResposta },
      },
    },
    async (pedido) => alerta.enviarAlerta(pedido.body),
  )
}
