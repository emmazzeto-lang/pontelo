import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { confirmacao } from '../esquemas/auth.esquemas.js'
import { novoServico, servicoCriado } from '../esquemas/moderacao.esquemas.js'
import { erroResposta, idServico } from '../esquemas/servicos.esquemas.js'
import { autenticar } from '../plugins/autenticacao.js'
import { sugerir } from '../servicos/moderacao.servico.js'
import * as servicos from '../servicos/servicos.servico.js'

// Rotas de quem está logado e colabora com o mapa. O "Sugerir serviço" (Dia 3) também entra aqui.
export const rotasColaboracao: FastifyPluginAsyncZod = async (app) => {
  // Todas as rotas deste arquivo exigem login
  app.addHook('preHandler', autenticar)

  app.post(
    '/servicos',
    {
      // Cada sugestão consulta o Nominatim (1 por segundo no máximo): limite apertado por IP
      config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
      schema: {
        tags: ['Colaboração'],
        summary: 'Sugere um serviço novo. Ele entra como pendente e só aparece depois da moderação.',
        security: [{ bearer: [] }],
        body: novoServico,
        response: { 201: servicoCriado, 400: erroResposta, 401: erroResposta, 422: erroResposta },
      },
    },
    async (pedido, resposta) => {
      const resultado = await sugerir(pedido.body, pedido.user.sub)
      return resposta.status(201).send(resultado)
    },
  )

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
