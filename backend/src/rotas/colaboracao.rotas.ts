import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { confirmacao } from '../esquemas/auth.esquemas.js'
import { erroResposta, idServico } from '../esquemas/servicos.esquemas.js'
import { autenticar } from '../plugins/autenticacao.js'
import * as servicos from '../servicos/servicos.servico.js'

// Rotas de quem está logado e colabora com o mapa. O "Sugerir serviço" (Dia 3) também entra aqui.
export const rotasColaboracao: FastifyPluginAsyncZod = async (app) => {
  // Todas as rotas deste arquivo exigem login
  app.addHook('preHandler', autenticar)

  app.post(
    '/servicos/:id/confirmacoes',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 hour' } },
      schema: {
        tags: ['Colaboração'],
        summary: 'Confirma que o serviço ainda funciona (renova o selo de confiança)',
        security: [{ bearer: [] }],
        params: idServico,
        response: { 201: confirmacao, 401: erroResposta, 404: erroResposta, 409: erroResposta },
      },
    },
    async (pedido, resposta) => {
      const resultado = await servicos.confirmar(pedido.params.id, pedido.user.sub)
      return resposta.status(201).send(resultado)
    },
  )
}
